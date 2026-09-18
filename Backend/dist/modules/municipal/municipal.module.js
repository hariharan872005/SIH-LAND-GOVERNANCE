"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MunicipalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const municipal_assessment_entity_1 = require("./entities/municipal-assessment.entity");
const municipal_service_1 = require("./municipal.service");
const municipal_controller_1 = require("./municipal.controller");
let MunicipalModule = class MunicipalModule {
};
exports.MunicipalModule = MunicipalModule;
exports.MunicipalModule = MunicipalModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([land_parcel_entity_1.LandParcel, land_verification_entity_1.LandVerification, municipal_assessment_entity_1.MunicipalAssessment])],
        controllers: [municipal_controller_1.MunicipalController],
        providers: [municipal_service_1.MunicipalService],
        exports: [municipal_service_1.MunicipalService],
    })
], MunicipalModule);
//# sourceMappingURL=municipal.module.js.map