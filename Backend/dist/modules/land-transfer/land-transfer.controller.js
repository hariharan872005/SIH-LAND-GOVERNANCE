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
exports.LandTransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const land_transfer_service_1 = require("./land-transfer.service");
const create_transfer_dto_1 = require("./dto/create-transfer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LandTransferController = class LandTransferController {
    constructor(transferService) {
        this.transferService = transferService;
    }
    async executeTransfer(dto, subRegistrar, headers) {
        const idempotencyKey = headers['idempotency-key'] || headers['x-idempotency-key'];
        return this.transferService.executeOwnershipTransfer(dto, subRegistrar, idempotencyKey);
    }
    async getTransfers(landId) {
        return this.transferService.getTransfersByLand(landId);
    }
    async getOwnershipHistory(landId) {
        return this.transferService.getOwnershipHistory(landId);
    }
};
exports.LandTransferController = LandTransferController;
__decorate([
    (0, common_1.Post)(['land-transfers', 'transfers']),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Update / Transfer Land Ownership' }),
    (0, swagger_1.ApiHeader)({ name: 'Idempotency-Key', required: false, description: 'Unique Key for transfer request idempotency' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.TAHSILDAR, roles_enum_1.OfficerRole.SUB_REGISTRAR, roles_enum_1.OfficerRole.SURVEYOR, roles_enum_1.OfficerRole.REVENUE_OFFICER, roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.CREATE_TRANSFER),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ownership transfer successful' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'OWNER_STATE_CHANGED - Current ownership mismatch' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transfer_dto_1.CreateTransferDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LandTransferController.prototype, "executeTransfer", null);
__decorate([
    (0, common_1.Get)(['land-transfers/land/:landId', 'transfers/land/:landId']),
    (0, swagger_1.ApiOperation)({ summary: 'Get registered deed transfers for a land parcel' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_TRANSFER_HISTORY),
    __param(0, (0, common_1.Param)('landId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandTransferController.prototype, "getTransfers", null);
__decorate([
    (0, common_1.Get)(['land-transfers/history/:landId', 'transfers/history/:landId']),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete ownership history for a land parcel' }),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.VIEW_TRANSFER_HISTORY, permissions_enum_1.PermissionCode.VIEW_OWNERSHIP),
    __param(0, (0, common_1.Param)('landId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandTransferController.prototype, "getOwnershipHistory", null);
exports.LandTransferController = LandTransferController = __decorate([
    (0, swagger_1.ApiTags)('Land Transfers & Deeds'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [land_transfer_service_1.LandTransferService])
], LandTransferController);
//# sourceMappingURL=land-transfer.controller.js.map