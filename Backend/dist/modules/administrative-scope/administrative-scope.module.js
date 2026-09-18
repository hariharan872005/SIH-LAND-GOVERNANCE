"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministrativeScopeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const state_entity_1 = require("./entities/state.entity");
const district_entity_1 = require("./entities/district.entity");
const taluk_entity_1 = require("./entities/taluk.entity");
const village_entity_1 = require("./entities/village.entity");
const administrative_scope_service_1 = require("./administrative-scope.service");
const administrative_scope_controller_1 = require("./administrative-scope.controller");
let AdministrativeScopeModule = class AdministrativeScopeModule {
};
exports.AdministrativeScopeModule = AdministrativeScopeModule;
exports.AdministrativeScopeModule = AdministrativeScopeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([state_entity_1.State, district_entity_1.District, taluk_entity_1.Taluk, village_entity_1.Village])],
        controllers: [administrative_scope_controller_1.AdministrativeScopeController],
        providers: [administrative_scope_service_1.AdministrativeScopeService],
        exports: [administrative_scope_service_1.AdministrativeScopeService],
    })
], AdministrativeScopeModule);
//# sourceMappingURL=administrative-scope.module.js.map