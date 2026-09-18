"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwinModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const land_transfer_transaction_entity_1 = require("../land-transfer/entities/land-transfer-transaction.entity");
const municipal_assessment_entity_1 = require("../municipal/entities/municipal-assessment.entity");
const document_record_entity_1 = require("../documents/entities/document-record.entity");
const digital_twin_service_1 = require("./digital-twin.service");
const digital_twin_controller_1 = require("./digital-twin.controller");
let DigitalTwinModule = class DigitalTwinModule {
};
exports.DigitalTwinModule = DigitalTwinModule;
exports.DigitalTwinModule = DigitalTwinModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                land_parcel_entity_1.LandParcel,
                land_verification_entity_1.LandVerification,
                land_transfer_transaction_entity_1.LandTransferTransaction,
                municipal_assessment_entity_1.MunicipalAssessment,
                document_record_entity_1.DocumentRecord,
            ]),
        ],
        controllers: [digital_twin_controller_1.DigitalTwinController],
        providers: [digital_twin_service_1.DigitalTwinService],
        exports: [digital_twin_service_1.DigitalTwinService],
    })
], DigitalTwinModule);
//# sourceMappingURL=digital-twin.module.js.map