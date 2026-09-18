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
exports.LandOwnershipHistory = void 0;
const typeorm_1 = require("typeorm");
const land_parcel_entity_1 = require("./land-parcel.entity");
let LandOwnershipHistory = class LandOwnershipHistory {
};
exports.LandOwnershipHistory = LandOwnershipHistory;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], LandOwnershipHistory.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, nullable: true }),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "ownerIdHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LandOwnershipHistory.prototype, "ownershipStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LandOwnershipHistory.prototype, "ownershipEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, default: 'SALE' }),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "acquisitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandOwnershipHistory.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], LandOwnershipHistory.prototype, "isCurrent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LandOwnershipHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LandOwnershipHistory.prototype, "updatedAt", void 0);
exports.LandOwnershipHistory = LandOwnershipHistory = __decorate([
    (0, typeorm_1.Entity)('land_ownership_history')
], LandOwnershipHistory);
//# sourceMappingURL=land-ownership-history.entity.js.map