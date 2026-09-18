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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_service_1 = require("./organization.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let OrganizationController = class OrganizationController {
    constructor(orgService) {
        this.orgService = orgService;
    }
    async getDepartments() {
        return this.orgService.getDepartments();
    }
    async createDepartment(body, user) {
        return this.orgService.createDepartment(body, user);
    }
    async toggleDepartmentStatus(id, user) {
        return this.orgService.toggleDepartmentStatus(id, user);
    }
    async getDesignations(departmentId) {
        return this.orgService.getDesignations(departmentId);
    }
    async createDesignation(body, user) {
        return this.orgService.createDesignation(body, user);
    }
    async getOfficers(pagination, departmentId, stateId) {
        return this.orgService.getOfficers(pagination, { departmentId, stateId });
    }
    async createOfficer(body, user) {
        return this.orgService.createOfficer(body, user);
    }
    async updateOfficerPut(id, body, user) {
        return this.orgService.updateOfficer(id, body, user);
    }
    async updateOfficerPatch(id, body, user) {
        return this.orgService.updateOfficer(id, body, user);
    }
    async resetOfficerAccess(id, user) {
        return this.orgService.resetOfficerAccess(id, user);
    }
    async toggleOfficerStatus(id, user) {
        return this.orgService.toggleOfficerStatus(id, user);
    }
    async deleteOfficer(id, user) {
        return this.orgService.deleteOfficer(id, user);
    }
    async getRoles() {
        return this.orgService.getRoles();
    }
    async getPermissions() {
        return this.orgService.getPermissions();
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Get)('departments'),
    (0, swagger_1.ApiOperation)({ summary: 'List all dynamic departments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.Post)('departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create department (Super Admin Only)' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_DEPARTMENTS),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Patch)('departments/:id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle department status' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_DEPARTMENTS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "toggleDepartmentStatus", null);
__decorate([
    (0, common_1.Get)('designations'),
    (0, swagger_1.ApiOperation)({ summary: 'List designations by department' }),
    __param(0, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getDesignations", null);
__decorate([
    (0, common_1.Post)('designations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create designation' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_DESIGNATIONS),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createDesignation", null);
__decorate([
    (0, common_1.Get)('officers'),
    (0, swagger_1.ApiOperation)({ summary: 'List government officers with scope' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('departmentId')),
    __param(2, (0, common_1.Query)('stateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getOfficers", null);
__decorate([
    (0, common_1.Post)('officers'),
    (0, swagger_1.ApiOperation)({ summary: 'Onboard new officer' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createOfficer", null);
__decorate([
    (0, common_1.Put)('officers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update officer profile credentials and scope' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateOfficerPut", null);
__decorate([
    (0, common_1.Patch)('officers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update officer profile credentials and scope' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateOfficerPatch", null);
__decorate([
    (0, common_1.Post)('officers/:id/reset-access'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset officer login password' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "resetOfficerAccess", null);
__decorate([
    (0, common_1.Patch)('officers/:id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate / Deactivate officer' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "toggleOfficerStatus", null);
__decorate([
    (0, common_1.Delete)('officers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete officer login ID (Super Admin Only)' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.MANAGE_USERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteOfficer", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system and custom roles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system permission definitions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getPermissions", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('Organization & Governance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map