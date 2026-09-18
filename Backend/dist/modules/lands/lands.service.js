"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LandsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const land_parcel_entity_1 = require("./entities/land-parcel.entity");
const land_owner_entity_1 = require("./entities/land-owner.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const status_enum_1 = require("../../common/constants/status.enum");
const neo4j_service_1 = require("../../integrations/neo4j/neo4j.service");
const kafka_producer_service_1 = require("../../integrations/kafka/kafka-producer.service");
const events_enum_1 = require("../../common/constants/events.enum");
const redis_service_1 = require("../../integrations/redis/redis.service");
const opensearch_service_1 = require("../../integrations/opensearch/opensearch.service");
const audit_service_1 = require("../audit/audit.service");
const uuid_1 = require("uuid");
let LandsService = LandsService_1 = class LandsService {
    constructor(landRepo, ownerRepo, verificationRepo, neo4jService, kafkaProducer, redisService, openSearchService, auditService, dataSource) {
        this.landRepo = landRepo;
        this.ownerRepo = ownerRepo;
        this.verificationRepo = verificationRepo;
        this.neo4jService = neo4jService;
        this.kafkaProducer = kafkaProducer;
        this.redisService = redisService;
        this.openSearchService = openSearchService;
        this.auditService = auditService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(LandsService_1.name);
    }
    async createParcelByTahsildar(dto, officer) {
        if (officer.role !== 'SUPER_ADMIN') {
            if (officer.scope?.stateId && officer.scope.stateId !== dto.stateId) {
                throw new common_1.ForbiddenException('You cannot create land records outside your authorized state.');
            }
            if (officer.scope?.districtId && officer.scope.districtId !== dto.districtId) {
                throw new common_1.ForbiddenException('You cannot create land records outside your authorized district.');
            }
            if (officer.scope?.talukId && officer.scope.talukId !== dto.talukId) {
                throw new common_1.ForbiddenException('You cannot create land records outside your authorized taluk.');
            }
        }
        const existing = await this.landRepo.findOne({ where: { landId: dto.landId.toUpperCase() } });
        if (existing) {
            throw new common_1.ConflictException(`Land parcel with ID ${dto.landId} already exists.`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const centerLat = 13.1145 + (Math.random() - 0.5) * 0.003;
            const centerLng = 80.1555 + (Math.random() - 0.5) * 0.003;
            const w = 0.00032 + (Math.random() * 0.00012);
            const h = 0.00028 + (Math.random() * 0.00012);
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
            let validOfficerId = null;
            if (officer?.id) {
                const officerExists = await queryRunner.manager.query(`SELECT id FROM officers WHERE id = $1 LIMIT 1`, [officer.id]);
                if (officerExists && officerExists.length > 0) {
                    validOfficerId = officerExists[0].id;
                }
                else if (officer?.email) {
                    const officerByEmail = await queryRunner.manager.query(`SELECT id FROM officers WHERE LOWER(email) = LOWER($1) LIMIT 1`, [officer.email]);
                    if (officerByEmail && officerByEmail.length > 0) {
                        validOfficerId = officerByEmail[0].id;
                    }
                }
            }
            const newLand = queryRunner.manager.create(land_parcel_entity_1.LandParcel, {
                id: (0, uuid_1.v4)(),
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
                status: status_enum_1.LandStatus.REQUIRES_SURVEY,
                createdByOfficerId: validOfficerId || undefined,
                gisCoordinatesJson: geoJson,
                geoServerLayerName: `national_cadastre:${dto.landId.toLowerCase()}_poly`,
            });
            const savedLand = await queryRunner.manager.save(newLand);
            await queryRunner.query(`UPDATE land_parcels SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`, [JSON.stringify(geoJson), savedLand.id]);
            const initialOwner = queryRunner.manager.create(land_owner_entity_1.LandOwner, {
                id: (0, uuid_1.v4)(),
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
            const vRevenue = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                id: (0, uuid_1.v4)(),
                landId: savedLand.id,
                departmentId: 'dept_rev_01',
                officerId: validOfficerId || undefined,
                status: status_enum_1.VerificationStatus.VERIFIED,
                remarks: `Primary parcel and RoR ownership initiated. Ref: ${dto.existingLandRecordRef || 'Govt Gazette'}`,
                submittedAt: new Date(),
                verifiedAt: new Date(),
            });
            const vSurvey = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                id: (0, uuid_1.v4)(),
                landId: savedLand.id,
                departmentId: 'dept_surv_02',
                status: status_enum_1.VerificationStatus.PENDING,
                remarks: 'Awaiting DGPS field survey and boundary polygon demarcation by Cadastral Surveyor.',
                submittedAt: new Date(),
            });
            const vRegistration = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                id: (0, uuid_1.v4)(),
                landId: savedLand.id,
                departmentId: 'dept_reg_03',
                status: status_enum_1.VerificationStatus.PENDING,
                remarks: 'Awaiting deed verification and registration validation by Sub-Registrar.',
                submittedAt: new Date(),
            });
            const vMunicipality = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                id: (0, uuid_1.v4)(),
                landId: savedLand.id,
                departmentId: 'dept_muni_04',
                status: status_enum_1.VerificationStatus.PENDING,
                remarks: 'Awaiting property tax and local-body layout compliance by Municipal Revenue Officer.',
                submittedAt: new Date(),
            });
            await queryRunner.manager.save([vRevenue, vSurvey, vRegistration, vMunicipality]);
            await queryRunner.commitTransaction();
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
            this.kafkaProducer.emitEvent(events_enum_1.KafkaTopics.LAND_EVENTS, events_enum_1.DomainEventType.LAND_CREATED, savedLand.landId, 'LAND', { id: officer.id, role: officer.role }, { landId: savedLand.landId, surveyNumber: savedLand.surveyNumber, status: savedLand.status });
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
            await this.redisService.delByPattern('land:*');
            return savedLand;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getLandParcels(pagination, filters, officer) {
        const qb = this.landRepo.createQueryBuilder('land')
            .leftJoinAndSelect('land.state', 'state')
            .leftJoinAndSelect('land.district', 'district')
            .leftJoinAndSelect('land.taluk', 'taluk')
            .leftJoinAndSelect('land.village', 'village')
            .leftJoinAndSelect('land.owners', 'owners', 'owners.isCurrentOwner = true')
            .leftJoinAndSelect('land.verifications', 'verifications')
            .leftJoinAndSelect('verifications.department', 'department');
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
        if (filters?.status && filters.status !== 'ALL') {
            qb.andWhere('land.status = :status', { status: filters.status });
        }
        if (filters?.landType && filters.landType !== 'ALL') {
            qb.andWhere('land.landType = :landType', { landType: filters.landType });
        }
        if (pagination.search) {
            const term = pagination.search.replace(/^#/, '').trim();
            qb.andWhere('(land.landId ILIKE :search OR land.surveyNumber ILIKE :search OR owners.ownerName ILIKE :search OR district.name ILIKE :search OR taluk.name ILIKE :search OR village.name ILIKE :search OR state.name ILIKE :search)', { search: `%${term}%` });
        }
        qb.orderBy('land.createdAt', pagination.sortOrder || 'DESC');
        qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
        qb.take(pagination.pageSize || 20);
        const [items, total] = await qb.getManyAndCount();
        return new pagination_dto_1.PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
    }
    async getLandById(identifier) {
        const cacheKey = `land:${identifier.toUpperCase()}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
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
            throw new common_1.NotFoundException(`Land parcel ${identifier} not found`);
        }
        await this.redisService.set(cacheKey, land, 180);
        return land;
    }
};
exports.LandsService = LandsService;
exports.LandsService = LandsService = LandsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __param(1, (0, typeorm_1.InjectRepository)(land_owner_entity_1.LandOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(land_verification_entity_1.LandVerification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        neo4j_service_1.Neo4jService,
        kafka_producer_service_1.KafkaProducerService,
        redis_service_1.RedisService,
        opensearch_service_1.OpenSearchService,
        audit_service_1.AuditService,
        typeorm_2.DataSource])
], LandsService);
//# sourceMappingURL=lands.service.js.map