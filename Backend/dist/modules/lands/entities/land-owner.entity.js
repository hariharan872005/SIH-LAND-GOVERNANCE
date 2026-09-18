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
exports.LandOwner = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const land_parcel_entity_1 = require("./land-parcel.entity");
let LandOwner = class LandOwner {
};
exports.LandOwner = LandOwner;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], LandOwner.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandOwner.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, (land) => land.owners, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], LandOwner.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], LandOwner.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandOwner.prototype, "ownerIdHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32, nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "maskedAadhaarOrId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: status_enum_1.OwnershipType, default: status_enum_1.OwnershipType.INDIVIDUAL }),
    __metadata("design:type", String)
], LandOwner.prototype, "ownershipType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 100.0 }),
    __metadata("design:type", Number)
], LandOwner.prototype, "ownershipPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], LandOwner.prototype, "isCurrentOwner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LandOwner.prototype, "acquiredDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LandOwner.prototype, "relinquishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "deedRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "mutationDocketNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LandOwner.prototype, "considerationAmountINR", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LandOwner.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LandOwner.prototype, "updatedAt", void 0);
exports.LandOwner = LandOwner = __decorate([
    (0, typeorm_1.Entity)('land_owners')
], LandOwner);
//# sourceMappingURL=land-owner.entity.js.map