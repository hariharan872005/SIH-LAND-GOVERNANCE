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
exports.AdministrativeScopeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const administrative_scope_service_1 = require("./administrative-scope.service");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let AdministrativeScopeController = class AdministrativeScopeController {
    constructor(scopeService) {
        this.scopeService = scopeService;
    }
    async getStates() {
        return this.scopeService.getAllStates();
    }
    async getDistricts(stateId) {
        return this.scopeService.getDistrictsByState(stateId);
    }
    async getTaluks(districtId) {
        return this.scopeService.getTaluksByDistrict(districtId);
    }
    async getVillages(talukId) {
        return this.scopeService.getVillagesByTaluk(talukId);
    }
};
exports.AdministrativeScopeController = AdministrativeScopeController;
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('states'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Indian States / UTs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdministrativeScopeController.prototype, "getStates", null);
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('states/:stateId/districts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get districts within a State' }),
    __param(0, (0, common_1.Param)('stateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministrativeScopeController.prototype, "getDistricts", null);
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('districts/:districtId/taluks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get taluks / tehsils within a District' }),
    __param(0, (0, common_1.Param)('districtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministrativeScopeController.prototype, "getTaluks", null);
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('taluks/:talukId/villages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get villages / wards within a Taluk' }),
    __param(0, (0, common_1.Param)('talukId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministrativeScopeController.prototype, "getVillages", null);
exports.AdministrativeScopeController = AdministrativeScopeController = __decorate([
    (0, swagger_1.ApiTags)('Administrative Scope'),
    (0, common_1.Controller)('administrative-scope'),
    __metadata("design:paramtypes", [administrative_scope_service_1.AdministrativeScopeService])
], AdministrativeScopeController);
//# sourceMappingURL=administrative-scope.controller.js.map