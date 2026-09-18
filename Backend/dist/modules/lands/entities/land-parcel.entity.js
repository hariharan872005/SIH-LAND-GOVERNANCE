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
exports.LandParcel = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const state_entity_1 = require("../../administrative-scope/entities/state.entity");
const district_entity_1 = require("../../administrative-scope/entities/district.entity");
const taluk_entity_1 = require("../../administrative-scope/entities/taluk.entity");
const village_entity_1 = require("../../administrative-scope/entities/village.entity");
const land_owner_entity_1 = require("./land-owner.entity");
const land_verification_entity_1 = require("../../verification/entities/land-verification.entity");
const land_transfer_transaction_entity_1 = require("../../land-transfer/entities/land-transfer-transaction.entity");
const document_record_entity_1 = require("../../documents/entities/document-record.entity");
let LandParcel = class LandParcel {
};
exports.LandParcel = LandParcel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], LandParcel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], LandParcel.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "surveyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], LandParcel.prototype, "subdivisionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => state_entity_1.State),
    (0, typeorm_1.JoinColumn)({ name: 'stateId' }),
    __metadata("design:type", state_entity_1.State)
], LandParcel.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "districtId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => district_entity_1.District),
    (0, typeorm_1.JoinColumn)({ name: 'districtId' }),
    __metadata("design:type", district_entity_1.District)
], LandParcel.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "talukId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taluk_entity_1.Taluk),
    (0, typeorm_1.JoinColumn)({ name: 'talukId' }),
    __metadata("design:type", taluk_entity_1.Taluk)
], LandParcel.prototype, "taluk", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "villageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => village_entity_1.Village),
    (0, typeorm_1.JoinColumn)({ name: 'villageId' }),
    __metadata("design:type", village_entity_1.Village)
], LandParcel.prototype, "village", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: status_enum_1.LandType, default: status_enum_1.LandType.COMMERCIAL }),
    __metadata("design:type", String)
], LandParcel.prototype, "landType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, default: 'General Revenue Land' }),
    __metadata("design:type", String)
], LandParcel.prototype, "classification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], LandParcel.prototype, "registeredArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], LandParcel.prototype, "measuredArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LandParcel.prototype, "marketValueINR", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_enum_1.LandStatus,
        default: status_enum_1.LandStatus.REQUIRES_SURVEY,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: true,
    }),
    (0, typeorm_1.Index)({ spatial: true }),
    __metadata("design:type", Object)
], LandParcel.prototype, "geometry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LandParcel.prototype, "gisCoordinatesJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, default: 'national_cadastre:parcel_poly' }),
    __metadata("design:type", String)
], LandParcel.prototype, "geoServerLayerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LandParcel.prototype, "isDisputed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandParcel.prototype, "disputeDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], LandParcel.prototype, "createdByOfficerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandParcel.prototype, "currentOwnerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => land_owner_entity_1.LandOwner, (owner) => owner.land, { cascade: true }),
    __metadata("design:type", Array)
], LandParcel.prototype, "owners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => land_verification_entity_1.LandVerification, (ver) => ver.land),
    __metadata("design:type", Array)
], LandParcel.prototype, "verifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => land_transfer_transaction_entity_1.LandTransferTransaction, (tx) => tx.land),
    __metadata("design:type", Array)
], LandParcel.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_record_entity_1.DocumentRecord, (doc) => doc.land),
    __metadata("design:type", Array)
], LandParcel.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LandParcel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LandParcel.prototype, "updatedAt", void 0);
exports.LandParcel = LandParcel = __decorate([
    (0, typeorm_1.Entity)('land_parcels')
], LandParcel);
//# sourceMappingURL=land-parcel.entity.js.map