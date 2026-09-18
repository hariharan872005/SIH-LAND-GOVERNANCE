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
var MunicipalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MunicipalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const municipal_assessment_entity_1 = require("./entities/municipal-assessment.entity");
const status_enum_1 = require("../../common/constants/status.enum");
const kafka_producer_service_1 = require("../../integrations/kafka/kafka-producer.service");
const events_enum_1 = require("../../common/constants/events.enum");
const redis_service_1 = require("../../integrations/redis/redis.service");
const audit_service_1 = require("../audit/audit.service");
const uuid_1 = require("uuid");
let MunicipalService = MunicipalService_1 = class MunicipalService {
    constructor(landRepo, verificationRepo, municipalRepo, kafkaProducer, redisService, auditService, dataSource) {
        this.landRepo = landRepo;
        this.verificationRepo = verificationRepo;
        this.municipalRepo = municipalRepo;
        this.kafkaProducer = kafkaProducer;
        this.redisService = redisService;
        this.auditService = auditService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(MunicipalService_1.name);
    }
    async submitMunicipalVerification(dto, officer) {
        const land = await this.landRepo.findOne({
            where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
            relations: ['verifications', 'verifications.department'],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel ${dto.landId} not found.`);
        }
        if (officer.role !== 'SUPER_ADMIN') {
            if (officer.scope?.talukId && officer.scope.talukId !== land.talukId) {
                throw new common_1.ForbiddenException('You are not authorized to assess municipal property outside your assigned zone.');
            }
        }
        if (land.status !== status_enum_1.LandStatus.REQUIRES_MUNICIPAL_VERIFICATION &&
            land.status !== status_enum_1.LandStatus.MUNICIPAL_IN_REVIEW &&
            land.status !== status_enum_1.LandStatus.REQUIRES_CORRECTION) {
            throw new common_1.BadRequestException(`Land parcel ${land.landId} is currently in state '${land.status}'. Expected 'REQUIRES_MUNICIPAL_VERIFICATION'.`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let assessment = await queryRunner.manager.findOne(municipal_assessment_entity_1.MunicipalAssessment, {
                where: { landId: land.id },
            });
            if (!assessment) {
                assessment = queryRunner.manager.create(municipal_assessment_entity_1.MunicipalAssessment, {
                    id: (0, uuid_1.v4)(),
                    landId: land.id,
                    propertyId: dto.propertyId,
                });
            }
            assessment.propertyId = dto.propertyId;
            assessment.taxClearanceUptoYear = dto.taxClearanceYear;
            assessment.isTaxCleared = true;
            assessment.builtUpAreaSqFt = dto.builtUpAreaSqFt || assessment.builtUpAreaSqFt || 0;
            assessment.floorsCount = dto.floorsCount || assessment.floorsCount || 1;
            assessment.occupancyStatus = dto.occupancyStatus || assessment.occupancyStatus || 'COMMERCIAL_OCCUPIED';
            assessment.municipalRemarks = dto.remarks || 'Municipal tax assessment verified against master plan.';
            assessment.verifiedByOfficerId = officer.id;
            await queryRunner.manager.save(assessment);
            let vMun = await queryRunner.manager.findOne(land_verification_entity_1.LandVerification, {
                where: { landId: land.id, departmentId: 'dept_muni_04' },
            });
            if (!vMun) {
                vMun = queryRunner.manager.create(land_verification_entity_1.LandVerification, {
                    landId: land.id,
                    departmentId: 'dept_muni_04',
                });
            }
            vMun.status = status_enum_1.VerificationStatus.VERIFIED;
            vMun.officerId = officer.id;
            vMun.remarks = `Property ID ${dto.propertyId} assessed. Tax dues cleared through FY ${dto.taxClearanceYear}. ${dto.remarks || ''}`;
            vMun.referenceDocketNumber = dto.propertyId;
            vMun.verifiedAt = new Date();
            await queryRunner.manager.save(vMun);
            const allVerifications = await queryRunner.manager.find(land_verification_entity_1.LandVerification, {
                where: { landId: land.id },
            });
            const requiredDepts = ['dept_rev_01', 'dept_surv_02', 'dept_reg_03', 'dept_muni_04'];
            const allFourVerified = requiredDepts.every((deptId) => {
                const v = allVerifications.find((item) => item.departmentId === deptId);
                return v && v.status === status_enum_1.VerificationStatus.VERIFIED;
            });
            if (allFourVerified) {
                land.status = status_enum_1.LandStatus.LAND_VERIFIED;
            }
            else {
                land.status = status_enum_1.LandStatus.MUNICIPAL_VERIFIED;
            }
            await queryRunner.manager.save(land);
            await queryRunner.commitTransaction();
            await this.redisService.del(`land:${land.landId}`);
            await this.redisService.delByPattern('land:*');
            this.kafkaProducer.emitEvent(events_enum_1.KafkaTopics.VERIFICATION_EVENTS, allFourVerified ? events_enum_1.DomainEventType.LAND_VERIFIED : events_enum_1.DomainEventType.MUNICIPAL_VERIFIED, land.landId, 'LAND', { id: officer.id, role: officer.role }, {
                landId: land.landId,
                propertyId: dto.propertyId,
                allFourVerified,
                finalStatus: land.status,
            });
            this.auditService.logEvent({
                actorId: officer.id,
                actorName: officer.fullName,
                actorRole: officer.role,
                action: allFourVerified ? 'LAND_VERIFIED' : 'MUNICIPAL_VERIFIED',
                entityType: 'LAND',
                entityId: land.landId,
                previousValue: { status: 'REQUIRES_MUNICIPAL_VERIFICATION' },
                newValue: {
                    status: land.status,
                    propertyId: dto.propertyId,
                    allFourVerified,
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
exports.MunicipalService = MunicipalService;
exports.MunicipalService = MunicipalService = MunicipalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __param(1, (0, typeorm_1.InjectRepository)(land_verification_entity_1.LandVerification)),
    __param(2, (0, typeorm_1.InjectRepository)(municipal_assessment_entity_1.MunicipalAssessment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        kafka_producer_service_1.KafkaProducerService,
        redis_service_1.RedisService,
        audit_service_1.AuditService,
        typeorm_2.DataSource])
], MunicipalService);
//# sourceMappingURL=municipal.service.js.map