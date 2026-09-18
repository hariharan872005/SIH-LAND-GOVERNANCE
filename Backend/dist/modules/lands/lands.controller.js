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
exports.LandsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lands_service_1 = require("./lands.service");
const create_land_dto_1 = require("./dto/create-land.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const jurisdiction_scope_guard_1 = require("../../common/guards/jurisdiction-scope.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const status_enum_1 = require("../../common/constants/status.enum");
let LandsController = class LandsController {
    constructor(landsService) {
        this.landsService = landsService;
    }
    async createLand(createLandDto, officer) {
        return this.landsService.createParcelByTahsildar(createLandDto, officer);
    }
    async getLands(pagination, stateId, districtId, talukId, status, landType, officer) {
        return this.landsService.getLandParcels(pagination, { stateId, districtId, talukId, status, landType }, officer);
    }
    async getLandById(id) {
        return this.landsService.getLandById(id);
    }
};
exports.LandsController = LandsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Primary Land Parcel Creation' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.TAHSILDAR, roles_enum_1.OfficerRole.SUB_REGISTRAR, roles_enum_1.OfficerRole.SURVEYOR, roles_enum_1.OfficerRole.REVENUE_OFFICER, roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequireJurisdiction)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_land_dto_1.CreateLandDto, Object]),
    __metadata("design:returntype", Promise)
], LandsController.prototype, "createLand", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Query land parcels with geographic scope enforcement and pagination' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_LAND),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('stateId')),
    __param(2, (0, common_1.Query)('districtId')),
    __param(3, (0, common_1.Query)('talukId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('landType')),
    __param(6, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], LandsController.prototype, "getLands", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Land Parcel Details by ID or Land ID' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_LAND),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandsController.prototype, "getLandById", null);
exports.LandsController = LandsController = __decorate([
    (0, swagger_1.ApiTags)('Land Parcels'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard, jurisdiction_scope_guard_1.JurisdictionScopeGuard),
    (0, common_1.Controller)('lands'),
    __metadata("design:paramtypes", [lands_service_1.LandsService])
], LandsController);
//# sourceMappingURL=lands.controller.js.map