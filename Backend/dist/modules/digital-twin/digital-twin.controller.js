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
exports.DigitalTwinController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const digital_twin_service_1 = require("./digital-twin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
let DigitalTwinController = class DigitalTwinController {
    constructor(digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }
    async getDigitalTwin(landId) {
        return this.digitalTwinService.getDigitalTwin(landId);
    }
};
exports.DigitalTwinController = DigitalTwinController;
__decorate([
    (0, common_1.Get)(':landId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unified Digital Twin aggregate (PostgreSQL + PostGIS + Neo4j + S3 + Verification)' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_LAND),
    __param(0, (0, common_1.Param)('landId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getDigitalTwin", null);
exports.DigitalTwinController = DigitalTwinController = __decorate([
    (0, swagger_1.ApiTags)('Digital Twins'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('digital-twins'),
    __metadata("design:paramtypes", [digital_twin_service_1.DigitalTwinService])
], DigitalTwinController);
//# sourceMappingURL=digital-twin.controller.js.map