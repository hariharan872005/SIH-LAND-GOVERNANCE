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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandTransferTransaction = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const land_parcel_entity_1 = require("../../lands/entities/land-parcel.entity");
const officer_entity_1 = require("../../organization/entities/officer.entity");
let LandTransferTransaction = class LandTransferTransaction {
};
exports.LandTransferTransaction = LandTransferTransaction;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, (land) => land.transactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], LandTransferTransaction.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "fromOwnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "fromOwnerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "toOwnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "toOwnerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "toOwnerIdHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_enum_1.TransferType,
        default: status_enum_1.TransferType.SALE,
    }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "transferType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "deedNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LandTransferTransaction.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LandTransferTransaction.prototype, "considerationAmountINR", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "subRegistrarOffice", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32, default: 'COMPLETED' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "createdByOfficerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => officer_entity_1.Officer, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'createdByOfficerId' }),
    __metadata("design:type", officer_entity_1.Officer)
], LandTransferTransaction.prototype, "approvedByOfficer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandTransferTransaction.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LandTransferTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LandTransferTransaction.prototype, "updatedAt", void 0);
exports.LandTransferTransaction = LandTransferTransaction = __decorate([
    (0, typeorm_1.Entity)('land_transfer_transactions')
], LandTransferTransaction);
//# sourceMappingURL=land-transfer-transaction.entity.js.map