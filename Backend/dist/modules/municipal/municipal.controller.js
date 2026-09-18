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
exports.MunicipalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const municipal_service_1 = require("./municipal.service");
const verify_municipal_dto_1 = require("./dto/verify-municipal.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MunicipalController = class MunicipalController {
    constructor(municipalService) {
        this.municipalService = municipalService;
    }
    async verifyMunicipal(dto, officer) {
        return this.municipalService.submitMunicipalVerification(dto, officer);
    }
};
exports.MunicipalController = MunicipalController;
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit municipal property assessment & tax clearance' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.TAHSILDAR, roles_enum_1.OfficerRole.SUB_REGISTRAR, roles_enum_1.OfficerRole.SURVEYOR, roles_enum_1.OfficerRole.REVENUE_OFFICER, roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VERIFY_PROPERTY),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_municipal_dto_1.VerifyMunicipalDto, Object]),
    __metadata("design:returntype", Promise)
], MunicipalController.prototype, "verifyMunicipal", null);
exports.MunicipalController = MunicipalController = __decorate([
    (0, swagger_1.ApiTags)('Municipal & Property Tax'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('municipal'),
    __metadata("design:paramtypes", [municipal_service_1.MunicipalService])
], MunicipalController);
//# sourceMappingURL=municipal.controller.js.map