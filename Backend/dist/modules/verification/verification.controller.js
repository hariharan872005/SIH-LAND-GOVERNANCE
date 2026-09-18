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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const verification_service_1 = require("./verification.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const verify_registration_dto_1 = require("./dto/verify-registration.dto");
const reopen_verification_dto_1 = require("./dto/reopen-verification.dto");
let VerificationController = class VerificationController {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async getVerifications(landId) {
        return this.verificationService.getVerificationsByLand(landId);
    }
    async verifyRegistration(dto, officer) {
        return this.verificationService.verifyRegistration(dto, officer);
    }
    async reopenVerification(dto, officer) {
        return this.verificationService.reopenVerification(dto, officer);
    }
    async flagCorrection(body, officer) {
        return this.verificationService.flagCorrectionOrReject(body.landId, body.departmentId, body.action, body.reason, officer);
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, common_1.Get)('land/:landId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get normalized LAND_VERIFICATION records for a parcel' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_LAND),
    __param(0, (0, common_1.Param)('landId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getVerifications", null);
__decorate([
    (0, common_1.Post)('registration'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Existing Owner / Registration Record' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.TAHSILDAR, roles_enum_1.OfficerRole.SUB_REGISTRAR, roles_enum_1.OfficerRole.SURVEYOR, roles_enum_1.OfficerRole.REVENUE_OFFICER, roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VERIFY_REGISTRATION),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration verification successful' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'REGISTRATION_ALREADY_VERIFIED - Duplicate verification forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_registration_dto_1.VerifyRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "verifyRegistration", null);
__decorate([
    (0, common_1.Post)('reopen'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reopen a verified record for correction / re-verification (Controlled Workflow)' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VERIFY_REGISTRATION, permissions_enum_1.PermissionCode.VERIFY_OWNERSHIP, permissions_enum_1.PermissionCode.MANAGE_SCOPE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reopen_verification_dto_1.ReopenVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "reopenVerification", null);
__decorate([
    (0, common_1.Post)('flag-correction'),
    (0, swagger_1.ApiOperation)({ summary: 'Flag defect / request correction or reject verification' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VERIFY_OWNERSHIP, permissions_enum_1.PermissionCode.SUBMIT_SURVEY_VERIFICATION, permissions_enum_1.PermissionCode.VERIFY_REGISTRATION, permissions_enum_1.PermissionCode.VERIFY_PROPERTY),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "flagCorrection", null);
exports.VerificationController = VerificationController = __decorate([
    (0, swagger_1.ApiTags)('Verification Matrix'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('verifications'),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], VerificationController);
//# sourceMappingURL=verification.controller.js.map