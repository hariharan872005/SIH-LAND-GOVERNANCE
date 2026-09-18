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
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const land_verification_entity_1 = require("./entities/land-verification.entity");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const status_enum_1 = require("../../common/constants/status.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const audit_service_1 = require("../audit/audit.service");
const jurisdiction_scope_guard_1 = require("../../common/guards/jurisdiction-scope.guard");
const uuid_1 = require("uuid");
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(verificationRepo, landRepo, auditService) {
        this.verificationRepo = verificationRepo;
        this.landRepo = landRepo;
        this.auditService = auditService;
        this.logger = new common_1.Logger(VerificationService_1.name);
        this.REGISTRATION_DEPT_ID = 'dept_reg_03';
    }
    async getVerificationsByLand(landId) {
        return this.verificationRepo.find({
            where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
            relations: ['department', 'officer'],
            order: { createdAt: 'ASC' },
        });
    }
    async verifyRegistration(dto, officer) {
        if (officer.role !== roles_enum_1.OfficerRole.SUB_REGISTRAR &&
            officer.role !== roles_enum_1.OfficerRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Sub-Registrar or Super Admin is authorized to verify land registration.');
        }
        const land = await this.landRepo.findOne({
            where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
            relations: ['state', 'district', 'taluk', 'village'],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel '${dto.landId}' not found.`);
        }
        (0, jurisdiction_scope_guard_1.validateLandJurisdiction)(officer, land);
        const surveyVerification = await this.verificationRepo.findOne({
            where: { landId: land.id, departmentId: 'dept_surv_02' },
        });
        if (!surveyVerification || surveyVerification.status !== status_enum_1.VerificationStatus.VERIFIED) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'SURVEY_VERIFICATION_REQUIRED',
                message: `Survey Verification Required: Land parcel '${land.landId}' must be verified by the Survey Department before Sub-Registrar registration verification can proceed.`,
            });
        }
        let verification = await this.verificationRepo.findOne({
            where: { landId: land.id, departmentId: this.REGISTRATION_DEPT_ID },
        });
        if (verification && verification.status === status_enum_1.VerificationStatus.VERIFIED) {
            this.logger.warn(`Duplicate registration verification attempted for land ${land.landId} by ${officer.fullName}`);
            throw new common_1.ConflictException({
                success: false,
                code: 'REGISTRATION_ALREADY_VERIFIED',
                message: 'Registration has already been verified.',
            });
        }
        if (!verification) {
            verification = this.verificationRepo.create({
                id: `ver_reg_${Date.now()}_${(0, uuid_1.v4)().slice(0, 8)}`,
                landId: land.id,
                departmentId: this.REGISTRATION_DEPT_ID,
            });
        }
        verification.status = status_enum_1.VerificationStatus.VERIFIED;
        verification.remarks =
            dto.remarks || 'Registration ledger & deed ownership verified by Sub-Registrar.';
        verification.officerId = officer.id;
        verification.verifiedAt = new Date();
        const savedVerification = await this.verificationRepo.save(verification);
        land.status = status_enum_1.LandStatus.REGISTRATION_VERIFIED;
        await this.landRepo.save(land);
        await this.auditService.logEvent({
            actorId: officer.id,
            actorName: officer.fullName,
            actorRole: officer.role,
            action: 'OWNER_VERIFICATION_COMPLETED',
            entityType: 'VERIFICATION',
            entityId: land.landId,
            newValue: {
                status: status_enum_1.VerificationStatus.VERIFIED,
                departmentId: this.REGISTRATION_DEPT_ID,
                remarks: verification.remarks,
                verifiedAt: verification.verifiedAt,
            },
        });
        return {
            success: true,
            status: status_enum_1.VerificationStatus.VERIFIED,
            verifiedBy: {
                id: officer.id,
                fullName: officer.fullName,
                role: officer.role,
                departmentId: officer.departmentId,
            },
            verifiedAt: savedVerification.verifiedAt,
        };
    }
    async reopenVerification(dto, officer) {
        const departmentId = dto.departmentId || this.REGISTRATION_DEPT_ID;
        const land = await this.landRepo.findOne({
            where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
            relations: ['state', 'district', 'taluk', 'village'],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel '${dto.landId}' not found.`);
        }
        (0, jurisdiction_scope_guard_1.validateLandJurisdiction)(officer, land);
        const verification = await this.verificationRepo.findOne({
            where: { landId: land.id, departmentId },
        });
        if (!verification) {
            throw new common_1.NotFoundException(`Verification record for department ${departmentId} not found on land ${dto.landId}.`);
        }
        const previousStatus = verification.status;
        verification.status = status_enum_1.VerificationStatus.REQUIRES_CORRECTION;
        verification.remarks = `[REOPENED FOR CORRECTION] ${dto.reason}`;
        verification.officerId = officer.id;
        const saved = await this.verificationRepo.save(verification);
        land.status = status_enum_1.LandStatus.REQUIRES_CORRECTION;
        await this.landRepo.save(land);
        await this.auditService.logEvent({
            actorId: officer.id,
            actorName: officer.fullName,
            actorRole: officer.role,
            action: 'VERIFICATION_REOPENED',
            entityType: 'VERIFICATION',
            entityId: land.landId,
            previousValue: { status: previousStatus },
            newValue: {
                status: status_enum_1.VerificationStatus.REQUIRES_CORRECTION,
                reason: dto.reason,
                reopenedBy: officer.fullName,
                reopenedAt: new Date(),
            },
        });
        return {
            success: true,
            status: saved.status,
            previousStatus,
            reopenedBy: officer.fullName,
            reason: dto.reason,
            reopenedAt: new Date(),
        };
    }
    async flagCorrectionOrReject(landId, departmentId, action, reason, officer) {
        const land = await this.landRepo.findOne({
            where: [{ id: landId }, { landId: landId.toUpperCase() }],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel ${landId} not found.`);
        }
        (0, jurisdiction_scope_guard_1.validateLandJurisdiction)(officer, land);
        let verification = await this.verificationRepo.findOne({
            where: { landId: land.id, departmentId },
        });
        if (!verification) {
            verification = this.verificationRepo.create({
                id: `ver_${Date.now()}_${(0, uuid_1.v4)().slice(0, 8)}`,
                landId: land.id,
                departmentId,
            });
        }
        verification.status =
            action === 'REJECTED'
                ? status_enum_1.VerificationStatus.REJECTED
                : status_enum_1.VerificationStatus.REQUIRES_CORRECTION;
        verification.remarks = `[${action}] ${reason}`;
        verification.officerId = officer.id;
        if (action === 'REJECTED') {
            verification.rejectedAt = new Date();
        }
        const saved = await this.verificationRepo.save(verification);
        land.status =
            action === 'REJECTED'
                ? status_enum_1.LandStatus.REJECTED
                : status_enum_1.LandStatus.REQUIRES_CORRECTION;
        if (action === 'REJECTED') {
            land.isDisputed = true;
            land.disputeDetails = reason;
        }
        await this.landRepo.save(land);
        await this.auditService.logEvent({
            actorId: officer.id,
            actorName: officer.fullName,
            actorRole: officer.role,
            action: action === 'REJECTED' ? 'VERIFICATION_REJECTED' : 'REQUIRES_CORRECTION',
            entityType: 'VERIFICATION',
            entityId: land.landId,
            newValue: { action, reason, departmentId },
        });
        return saved;
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(land_verification_entity_1.LandVerification)),
    __param(1, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map