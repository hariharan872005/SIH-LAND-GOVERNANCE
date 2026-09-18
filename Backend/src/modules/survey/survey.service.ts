import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus, VerificationStatus } from '../../common/constants/status.enum';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { KafkaTopics, DomainEventType } from '../../common/constants/events.enum';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    @InjectRepository(LandVerification)
    private readonly verificationRepo: Repository<LandVerification>,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async submitSurveyVerification(dto: SubmitSurveyDto, surveyor: AuthenticatedUser): Promise<LandParcel> {
    const land = await this.landRepo.findOne({
      where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
      relations: ['verifications'],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel ${dto.landId} not found.`);
    }

    // 1. Enforce Jurisdiction
    if (surveyor.role !== 'SUPER_ADMIN') {
      if (surveyor.scope?.talukId && surveyor.scope.talukId !== land.talukId) {
        throw new ForbiddenException('You are not authorized to survey land outside your assigned taluk.');
      }
    }

    // 2. Validate State Machine
    if (
      land.status !== LandStatus.REQUIRES_SURVEY &&
      land.status !== LandStatus.SURVEY_IN_REVIEW &&
      land.status !== LandStatus.REQUIRES_CORRECTION
    ) {
      throw new BadRequestException(
        `Land parcel ${land.landId} is currently in state '${land.status}'. Expected 'REQUIRES_SURVEY'.`,
      );
    }

    if (!dto.polygonCoordinates || dto.polygonCoordinates.length < 3) {
      throw new BadRequestException('A cadastral spatial polygon requires at least 3 distinct boundary vertices.');
    }

    // Ensure polygon is closed
    const closedCoords = [...dto.polygonCoordinates];
    const first = closedCoords[0];
    const last = closedCoords[closedCoords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      closedCoords.push(first);
    }

    const geoJson = {
      type: 'Polygon',
      coordinates: [closedCoords],
    };

    const prevArea = land.measuredArea;
    const prevStatus = land.status;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      land.measuredArea = dto.measuredAreaAcres;
      land.gisCoordinatesJson = geoJson;
      land.status = LandStatus.REQUIRES_REGISTRATION_VERIFICATION; // State advances to next department

      await queryRunner.manager.save(land);

      // Update PostGIS spatial column
      await queryRunner.query(
        `UPDATE land_parcels SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`,
        [JSON.stringify(geoJson), land.id],
      );

      // Update normalized LAND_VERIFICATION Survey Record
      let vSur = await queryRunner.manager.findOne(LandVerification, {
        where: { landId: land.id, departmentId: 'dept_surv_02' },
      });

      if (!vSur) {
        vSur = queryRunner.manager.create(LandVerification, {
          landId: land.id,
          departmentId: 'dept_surv_02',
        });
      }

      vSur.status = VerificationStatus.VERIFIED;
      vSur.officerId = surveyor.id;
      vSur.remarks = dto.surveyRemarks;
      vSur.referenceDocketNumber = dto.surveyDocName || `DGPS-${land.landId}-2026`;
      vSur.verifiedAt = new Date();

      await queryRunner.manager.save(vSur);

      await queryRunner.commitTransaction();

      // Clear cache & emit async events
      await this.redisService.del(`land:${land.landId}`);
      await this.redisService.del(`digital_twin:${land.landId.toUpperCase()}`);
      await this.redisService.del(`digital_twin:${land.id.toUpperCase()}`);
      await this.redisService.delByPattern('land:*');
      await this.redisService.delByPattern('digital_twin:*');

      this.kafkaProducer.emitEvent(
        KafkaTopics.SURVEY_EVENTS,
        DomainEventType.SURVEY_VERIFIED,
        land.landId,
        'LAND',
        { id: surveyor.id, role: surveyor.role },
        {
          landId: land.landId,
          measuredAreaAcres: dto.measuredAreaAcres,
          nextStatus: LandStatus.REQUIRES_REGISTRATION_VERIFICATION,
        },
      );

      this.auditService.logEvent({
        actorId: surveyor.id,
        actorName: surveyor.fullName,
        actorRole: surveyor.role,
        action: 'SURVEY_SUBMITTED',
        entityType: 'LAND',
        entityId: land.landId,
        previousValue: { status: prevStatus, area: prevArea },
        newValue: {
          status: land.status,
          measuredArea: land.measuredArea,
          remarks: dto.surveyRemarks,
        },
      });

      return land;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
