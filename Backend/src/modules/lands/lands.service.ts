import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LandParcel } from './entities/land-parcel.entity';
import { LandOwner } from './entities/land-owner.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { CreateLandDto } from './dto/create-land.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus, VerificationStatus } from '../../common/constants/status.enum';
import { Neo4jService } from '../../integrations/neo4j/neo4j.service';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { KafkaTopics, DomainEventType } from '../../common/constants/events.enum';
import { RedisService } from '../../integrations/redis/redis.service';
import { OpenSearchService } from '../../integrations/opensearch/opensearch.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LandsService {
  private readonly logger = new Logger(LandsService.name);

  constructor(
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    @InjectRepository(LandOwner)
    private readonly ownerRepo: Repository<LandOwner>,
    @InjectRepository(LandVerification)
    private readonly verificationRepo: Repository<LandVerification>,
    private readonly neo4jService: Neo4jService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly redisService: RedisService,
    private readonly openSearchService: OpenSearchService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // =================== 1. TAHSILDAR PARCEL CREATION ===================
  async createParcelByTahsildar(dto: CreateLandDto, officer: AuthenticatedUser): Promise<LandParcel> {
    // 1. Enforce Geographical Authorization
    if (officer.role !== 'SUPER_ADMIN') {
      if (officer.scope?.stateId && officer.scope.stateId !== dto.stateId) {
        throw new ForbiddenException('You cannot create land records outside your authorized state.');
      }
      if (officer.scope?.districtId && officer.scope.districtId !== dto.districtId) {
        throw new ForbiddenException('You cannot create land records outside your authorized district.');
      }
      if (officer.scope?.talukId && officer.scope.talukId !== dto.talukId) {
        throw new ForbiddenException('You cannot create land records outside your authorized taluk.');
      }
    }

    const existing = await this.landRepo.findOne({ where: { landId: dto.landId.toUpperCase() } });
    if (existing) {
      throw new ConflictException(`Land parcel with ID ${dto.landId} already exists.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate small realistic plot footprint (approx 30m to 50m / 0.0003 deg)
      const centerLat = 13.1145 + (Math.random() - 0.5) * 0.003;
      const centerLng = 80.1555 + (Math.random() - 0.5) * 0.003;
      const w = 0.00032 + (Math.random() * 0.00012);
      const h = 0.00028 + (Math.random() * 0.00012);

      // Support realistic cadastral plot shape (e.g. L-shape or clean rectangular parcel)
      const isLShape = Math.random() > 0.4;
      const coordinates = isLShape
        ? [
            [
              [centerLng - w, centerLat - h],
              [centerLng + w * 0.35, centerLat - h],
              [centerLng + w * 0.35, centerLat + h * 0.15],
              [centerLng + w, centerLat + h * 0.15],
              [centerLng + w, centerLat + h],
              [centerLng - w, centerLat + h],
              [centerLng - w, centerLat - h],
            ],
          ]
        : [
            [
              [centerLng - w, centerLat - h],
              [centerLng + w, centerLat - h],
              [centerLng + w, centerLat + h],
              [centerLng - w, centerLat + h],
              [centerLng - w, centerLat - h],
            ],
          ];

      const geoJson = {
        type: 'Polygon',
        coordinates,
      };

      // Check if officer exists in DB
      let validOfficerId: string | null = null;
      if (officer?.id) {
        const officerExists = await queryRunner.manager.query(
          `SELECT id FROM officers WHERE id = $1 LIMIT 1`,
          [officer.id],
        );
        if (officerExists && officerExists.length > 0) {
          validOfficerId = officerExists[0].id;
        } else if (officer?.email) {
          const officerByEmail = await queryRunner.manager.query(
            `SELECT id FROM officers WHERE LOWER(email) = LOWER($1) LIMIT 1`,
            [officer.email],
          );
          if (officerByEmail && officerByEmail.length > 0) {
            validOfficerId = officerByEmail[0].id;
          }
        }
      }

      // 2. Create authoritative LandParcel record
      const newLand = queryRunner.manager.create(LandParcel, {
        id: uuidv4(),
        landId: dto.landId.toUpperCase(),
        surveyNumber: dto.surveyNumber,
        subdivisionNumber: dto.subdivisionNumber || '1',
        stateId: dto.stateId,
        districtId: dto.districtId,
        talukId: dto.talukId,
        villageId: dto.villageId,
        landType: dto.landType,
        classification: dto.classification || 'General Revenue Land',
        registeredArea: dto.registeredArea,
        measuredArea: dto.registeredArea,
        marketValueINR: dto.marketValueINR,
        status: LandStatus.REQUIRES_SURVEY, // State machine initiates at REQUIRES_SURVEY
        createdByOfficerId: validOfficerId || undefined,
        gisCoordinatesJson: geoJson,
        geoServerLayerName: `national_cadastre:${dto.landId.toLowerCase()}_poly`,
      });

      const savedLand = await queryRunner.manager.save(newLand);

      // Set PostGIS spatial geometry using raw query
      await queryRunner.query(
        `UPDATE land_parcels SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`,
        [JSON.stringify(geoJson), savedLand.id],
      );

      // 3. Create initial authoritative LandOwner entry
      const initialOwner = queryRunner.manager.create(LandOwner, {
        id: uuidv4(),
        landId: savedLand.id,
        ownerName: dto.ownerName,
        ownerIdHash: dto.ownerIdHash,
        maskedAadhaarOrId: `XXXX-XXXX-${dto.ownerIdHash.slice(-4) || '9124'}`,
        ownershipType: dto.ownershipType,
        ownershipPercentage: 100,
        isCurrentOwner: true,
        acquiredDate: new Date(),
        deedRegistrationNumber: dto.existingLandRecordRef || `INIT/PATTA/${Math.floor(1000 + Math.random() * 9000)}/2026`,
        considerationAmountINR: dto.marketValueINR,
      });

      await queryRunner.manager.save(initialOwner);

      // 4. Initialize Normalized LAND_VERIFICATION entries for all 4 departments
      const vRevenue = queryRunner.manager.create(LandVerification, {
        id: uuidv4(),
        landId: savedLand.id,
        departmentId: 'dept_rev_01',
        officerId: validOfficerId || undefined,
        status: VerificationStatus.VERIFIED,
        remarks: `Primary parcel and RoR ownership initiated. Ref: ${dto.existingLandRecordRef || 'Govt Gazette'}`,
        submittedAt: new Date(),
        verifiedAt: new Date(),
      });

      const vSurvey = queryRunner.manager.create(LandVerification, {
        id: uuidv4(),
        landId: savedLand.id,
        departmentId: 'dept_surv_02',
        status: VerificationStatus.PENDING,
        remarks: 'Awaiting DGPS field survey and boundary polygon demarcation by Cadastral Surveyor.',
        submittedAt: new Date(),
      });

      const vRegistration = queryRunner.manager.create(LandVerification, {
        id: uuidv4(),
        landId: savedLand.id,
        departmentId: 'dept_reg_03',
        status: VerificationStatus.PENDING,
        remarks: 'Awaiting deed verification and registration validation by Sub-Registrar.',
        submittedAt: new Date(),
      });

      const vMunicipality = queryRunner.manager.create(LandVerification, {
        id: uuidv4(),
        landId: savedLand.id,
        departmentId: 'dept_muni_04',
        status: VerificationStatus.PENDING,
        remarks: 'Awaiting property tax and local-body layout compliance by Municipal Revenue Officer.',
        submittedAt: new Date(),
      });

      await queryRunner.manager.save([vRevenue, vSurvey, vRegistration, vMunicipality]);

      await queryRunner.commitTransaction();

      // 5. Asynchronous Integrations (Neo4j, Kafka, OpenSearch, Audit)
      this.neo4jService.createOrUpdateLand({
        landId: savedLand.landId,
        surveyNumber: savedLand.surveyNumber,
        state: dto.stateId,
        district: dto.districtId,
        taluk: dto.talukId,
        village: dto.villageId,
        areaInAcres: dto.registeredArea,
        landType: dto.landType,
      }).catch((e) => this.logger.error(`Neo4j seed land error: ${e.message}`));

      this.neo4jService.createOrUpdatePerson({
        id: initialOwner.id,
        name: dto.ownerName,
        panOrAadhaarHash: dto.ownerIdHash,
        ownershipType: dto.ownershipType,
      }).catch((e) => this.logger.error(`Neo4j seed person error: ${e.message}`));

      this.kafkaProducer.emitEvent(
        KafkaTopics.LAND_EVENTS,
        DomainEventType.LAND_CREATED,
        savedLand.landId,
        'LAND',
        { id: officer.id, role: officer.role },
        { landId: savedLand.landId, surveyNumber: savedLand.surveyNumber, status: savedLand.status },
      );

      this.openSearchService.indexLandParcel(savedLand);

      this.auditService.logEvent({
        actorId: officer.id,
        actorName: officer.fullName,
        actorRole: officer.role,
        action: 'LAND_CREATED',
        entityType: 'LAND',
        entityId: savedLand.landId,
        newValue: { landId: savedLand.landId, surveyNumber: savedLand.surveyNumber, owner: dto.ownerName },
      });

      // Clear cache
      await this.redisService.delByPattern('land:*');

      return savedLand;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =================== 2. GET LAND PARCELS (WITH PAGINATION & SPATIAL) ===================
  async getLandParcels(
    pagination: PaginationDto,
    filters?: {
      stateId?: string;
      districtId?: string;
      talukId?: string;
      status?: LandStatus;
      landType?: string;
    },
    officer?: AuthenticatedUser,
  ): Promise<PaginatedResult<LandParcel>> {
    const qb = this.landRepo.createQueryBuilder('land')
      .leftJoinAndSelect('land.state', 'state')
      .leftJoinAndSelect('land.district', 'district')
      .leftJoinAndSelect('land.taluk', 'taluk')
      .leftJoinAndSelect('land.village', 'village')
      .leftJoinAndSelect('land.owners', 'owners', 'owners.isCurrentOwner = true')
      .leftJoinAndSelect('land.verifications', 'verifications')
      .leftJoinAndSelect('verifications.department', 'department');

    // Enforce Officer Scope if not Super Admin
    if (officer && officer.role !== 'SUPER_ADMIN') {
      if (officer.scope?.stateId) {
        qb.andWhere('(land.stateId = :stateScope OR state.name = :stateScope OR state.code = :stateScope)', { stateScope: officer.scope.stateId });
      }
      if (officer.scope?.districtId) {
        qb.andWhere('(land.districtId = :distScope OR district.name = :distScope)', { distScope: officer.scope.districtId });
      }
      if (officer.scope?.talukId) {
        qb.andWhere('(land.talukId = :talukScope OR taluk.name = :talukScope)', { talukScope: officer.scope.talukId });
      }
    }

    if (filters?.stateId && filters.stateId !== 'ALL') {
      qb.andWhere('(land.stateId = :stateId OR state.name = :stateId OR state.code = :stateId)', { stateId: filters.stateId });
    }
    if (filters?.districtId && filters.districtId !== 'ALL') {
      qb.andWhere('(land.districtId = :districtId OR district.name = :districtId)', { districtId: filters.districtId });
    }
    if (filters?.talukId && filters.talukId !== 'ALL') {
      qb.andWhere('(land.talukId = :talukId OR taluk.name = :talukId)', { talukId: filters.talukId });
    }
    if (filters?.status && (filters.status as any) !== 'ALL') {
      qb.andWhere('land.status = :status', { status: filters.status });
    }
    if (filters?.landType && filters.landType !== 'ALL') {
      qb.andWhere('land.landType = :landType', { landType: filters.landType });
    }

    if (pagination.search) {
      const term = pagination.search.replace(/^#/, '').trim();
      qb.andWhere(
        '(land.landId ILIKE :search OR land.surveyNumber ILIKE :search OR owners.ownerName ILIKE :search OR district.name ILIKE :search OR taluk.name ILIKE :search OR village.name ILIKE :search OR state.name ILIKE :search)',
        { search: `%${term}%` },
      );
    }

    qb.orderBy('land.createdAt', pagination.sortOrder || 'DESC');
    qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
    qb.take(pagination.pageSize || 20);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
  }

  // =================== 3. GET LAND BY ID / LAND_ID ===================
  async getLandById(identifier: string): Promise<LandParcel> {
    const cacheKey = `land:${identifier.toUpperCase()}`;
    const cached = await this.redisService.get<LandParcel>(cacheKey);
    if (cached) return cached;

    const cleanIdentifier = (identifier || '').trim();
    const land = await this.landRepo.findOne({
      where: [
        { id: cleanIdentifier },
        { landId: cleanIdentifier.toUpperCase() },
        { landId: cleanIdentifier.toLowerCase() },
        { surveyNumber: cleanIdentifier },
        { surveyNumber: cleanIdentifier.toUpperCase() },
        { surveyNumber: cleanIdentifier.replace(/\s+/g, '') },
      ],
      relations: [
        'state',
        'district',
        'taluk',
        'village',
        'owners',
        'verifications',
        'verifications.department',
        'verifications.officer',
        'transactions',
        'documents',
      ],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel ${identifier} not found`);
    }

    await this.redisService.set(cacheKey, land, 180);
    return land;
  }
}
