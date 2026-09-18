"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const department_entity_1 = require("./entities/department.entity");
const designation_entity_1 = require("./entities/designation.entity");
const officer_entity_1 = require("./entities/officer.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const state_entity_1 = require("../administrative-scope/entities/state.entity");
const district_entity_1 = require("../administrative-scope/entities/district.entity");
const taluk_entity_1 = require("../administrative-scope/entities/taluk.entity");
const village_entity_1 = require("../administrative-scope/entities/village.entity");
const organization_service_1 = require("./organization.service");
const organization_controller_1 = require("./organization.controller");
let OrganizationModule = class OrganizationModule {
};
exports.OrganizationModule = OrganizationModule;
exports.OrganizationModule = OrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                department_entity_1.Department,
                designation_entity_1.Designation,
                officer_entity_1.Officer,
                role_entity_1.Role,
                permission_entity_1.Permission,
                state_entity_1.State,
                district_entity_1.District,
                taluk_entity_1.Taluk,
                village_entity_1.Village,
            ]),
        ],
        controllers: [organization_controller_1.OrganizationController],
        providers: [organization_service_1.OrganizationService],
        exports: [organization_service_1.OrganizationService],
    })
], OrganizationModule);
//# sourceMappingURL=organization.module.js.map