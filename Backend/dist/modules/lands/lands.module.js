"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const land_parcel_entity_1 = require("./entities/land-parcel.entity");
const land_owner_entity_1 = require("./entities/land-owner.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const land_ownership_history_entity_1 = require("./entities/land-ownership-history.entity");
const lands_service_1 = require("./lands.service");
const lands_controller_1 = require("./lands.controller");
let LandsModule = class LandsModule {
};
exports.LandsModule = LandsModule;
exports.LandsModule = LandsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([land_parcel_entity_1.LandParcel, land_owner_entity_1.LandOwner, land_ownership_history_entity_1.LandOwnershipHistory, land_verification_entity_1.LandVerification])],
        controllers: [lands_controller_1.LandsController],
        providers: [lands_service_1.LandsService],
        exports: [lands_service_1.LandsService],
    })
], LandsModule);
//# sourceMappingURL=lands.module.js.map