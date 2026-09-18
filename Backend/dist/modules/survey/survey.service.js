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
var SurveyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const status_enum_1 = require("../../common/constants/status.enum");
const kafka_producer_service_1 = require("../../integrations/kafka/kafka-producer.service");
const events_enum_1 = require("../../common/constants/events.enum");
const redis_service_1 = require("../../integrations/redis/redis.service");
const audit_service_1 = require("../audit/audit.service");
let SurveyService = SurveyService_1 = class SurveyService {
    constructor(landRepo, verificationRepo, kafkaProducer, redisService, auditService, dataSource) {
        this.landRepo = landRepo;
        this.verificationRepo = verificationRepo;
        this.kafkaProducer = kafkaProducer;
        this.redisService = redisService;
        this.auditService = auditService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SurveyService_1.name);
    }
    async submitSurveyVerification(dto, surveyor) {
        const land = await this.landRepo.findOne({
            where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
            relations: ['verifications'],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel ${dto.landId} not found.`);
        }
        if (surveyor.role !== 'SUPER_ADMIN') {
            if (surveyor.scope?.talukId && surveyor.scope.talukId !== land.talukId) {
                throw new common_1.ForbiddenException('You are not authorized to survey land outside your assigned taluk.');
            }
        }
        if (land.status !== status_enum_1.LandStatus.REQUIRES_SURVEY &&
            land.status !== status_enum_1.LandStatus.SURVEY_IN_REVIEW &&
            land.status !== status_enum_1.LandStatus.REQUIRES_CORRECTION) {
            throw new common_1.BadRequestException(`Land parcel ${land.landId} is currently in state '${land.status}'. Expected 'REQUIRES_SURVEY'.`);
        }
        if (!dto.polygonCoordinates || dto.polygonCoordinates.length < 3) {
            throw new common_1.BadRequestException('A cadastral spatial polygon requires at least 3 distinct boundary vertices.');
        }
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
            land.status = status_enum_1.LandStatus.REQUIRES_REGISTRATION_VERIFICATION;
            await queryRunner.manager.save(land);
            await queryRunner.query(`UPDATE land_parcels SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`, [JSON.stringify(geoJson), land.id]);
            let vSur = await queryRunner.manager.findOne(land_verification_entity_1.LandVerification, {
                where: { landId: land.id, departmentId: 'dept_surv_02' },
            });
            if (!vSur) {
                vSur = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                    landId: land.id,
                    departmentId: 'dept_surv_02',
                });
            }
            vSur.status = status_enum_1.VerificationStatus.VERIFIED;
            vSur.officerId = surveyor.id;
            vSur.remarks = dto.surveyRemarks;
            vSur.referenceDocketNumber = dto.surveyDocName || `DGPS-${land.landId}-2026`;
            vSur.verifiedAt = new Date();
            await queryRunner.manager.save(vSur);
            await queryRunner.commitTransaction();
            await this.redisService.del(`land:${land.landId}`);
            await this.redisService.del(`digital_twin:${land.landId.toUpperCase()}`);
            await this.redisService.del(`digital_twin:${land.id.toUpperCase()}`);
            await this.redisService.delByPattern('land:*');
            await this.redisService.delByPattern('digital_twin:*');
            this.kafkaProducer.emitEvent(events_enum_1.KafkaTopics.SURVEY_EVENTS, events_enum_1.DomainEventType.SURVEY_VERIFIED, land.landId, 'LAND', { id: surveyor.id, role: surveyor.role }, {
                landId: land.landId,
                measuredAreaAcres: dto.measuredAreaAcres,
                nextStatus: status_enum_1.LandStatus.REQUIRES_REGISTRATION_VERIFICATION,
            });
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
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.SurveyService = SurveyService;
exports.SurveyService = SurveyService = SurveyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __param(1, (0, typeorm_1.InjectRepository)(land_verification_entity_1.LandVerification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        kafka_producer_service_1.KafkaProducerService,
        redis_service_1.RedisService,
        audit_service_1.AuditService,
        typeorm_2.DataSource])
], SurveyService);
//# sourceMappingURL=survey.service.js.map