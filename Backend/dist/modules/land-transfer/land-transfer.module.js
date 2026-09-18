"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandTransferModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_owner_entity_1 = require("../lands/entities/land-owner.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const land_transfer_transaction_entity_1 = require("./entities/land-transfer-transaction.entity");
const land_transfer_entity_1 = require("./entities/land-transfer.entity");
const land_ownership_history_entity_1 = require("../lands/entities/land-ownership-history.entity");
const outbox_event_entity_1 = require("../../integrations/kafka/entities/outbox-event.entity");
const idempotency_record_entity_1 = require("../../common/entities/idempotency-record.entity");
const land_transfer_service_1 = require("./land-transfer.service");
const land_transfer_controller_1 = require("./land-transfer.controller");
let LandTransferModule = class LandTransferModule {
};
exports.LandTransferModule = LandTransferModule;
exports.LandTransferModule = LandTransferModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                land_parcel_entity_1.LandParcel,
                land_owner_entity_1.LandOwner,
                land_verification_entity_1.LandVerification,
                land_transfer_transaction_entity_1.LandTransferTransaction,
                land_transfer_entity_1.LandTransfer,
                land_ownership_history_entity_1.LandOwnershipHistory,
                outbox_event_entity_1.OutboxEvent,
                idempotency_record_entity_1.IdempotencyRecord,
            ]),
        ],
        controllers: [land_transfer_controller_1.LandTransferController],
        providers: [land_transfer_service_1.LandTransferService],
        exports: [land_transfer_service_1.LandTransferService],
    })
], LandTransferModule);
//# sourceMappingURL=land-transfer.module.js.map