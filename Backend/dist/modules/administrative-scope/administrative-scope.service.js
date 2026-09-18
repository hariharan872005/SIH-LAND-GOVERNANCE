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
exports.AdministrativeScopeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const state_entity_1 = require("./entities/state.entity");
const district_entity_1 = require("./entities/district.entity");
const taluk_entity_1 = require("./entities/taluk.entity");
const village_entity_1 = require("./entities/village.entity");
let AdministrativeScopeService = class AdministrativeScopeService {
    constructor(stateRepo, districtRepo, talukRepo, villageRepo) {
        this.stateRepo = stateRepo;
        this.districtRepo = districtRepo;
        this.talukRepo = talukRepo;
        this.villageRepo = villageRepo;
    }
    async getAllStates() {
        return this.stateRepo.find({ order: { name: 'ASC' } });
    }
    async getDistrictsByState(stateId) {
        return this.districtRepo.find({
            where: { stateId },
            order: { name: 'ASC' },
        });
    }
    async getTaluksByDistrict(districtId) {
        return this.talukRepo.find({
            where: { districtId },
            order: { name: 'ASC' },
        });
    }
    async getVillagesByTaluk(talukId) {
        return this.villageRepo.find({
            where: { talukId },
            order: { name: 'ASC' },
        });
    }
    async resolveHierarchyNames(stateId, districtId, talukId, villageId) {
        const state = await this.stateRepo.findOne({ where: { id: stateId } });
        const district = districtId ? await this.districtRepo.findOne({ where: { id: districtId } }) : null;
        const taluk = talukId ? await this.talukRepo.findOne({ where: { id: talukId } }) : null;
        const village = villageId ? await this.villageRepo.findOne({ where: { id: villageId } }) : null;
        return {
            stateName: state?.name || stateId,
            districtName: district?.name || districtId,
            talukName: taluk?.name || talukId,
            villageName: village?.name || villageId,
        };
    }
};
exports.AdministrativeScopeService = AdministrativeScopeService;
exports.AdministrativeScopeService = AdministrativeScopeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(state_entity_1.State)),
    __param(1, (0, typeorm_1.InjectRepository)(district_entity_1.District)),
    __param(2, (0, typeorm_1.InjectRepository)(taluk_entity_1.Taluk)),
    __param(3, (0, typeorm_1.InjectRepository)(village_entity_1.Village)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdministrativeScopeService);
//# sourceMappingURL=administrative-scope.service.js.map