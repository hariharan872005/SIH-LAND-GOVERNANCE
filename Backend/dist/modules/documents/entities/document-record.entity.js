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
exports.DocumentRecord = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const land_parcel_entity_1 = require("../../lands/entities/land-parcel.entity");
const officer_entity_1 = require("../../organization/entities/officer.entity");
let DocumentRecord = class DocumentRecord {
};
exports.DocumentRecord = DocumentRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DocumentRecord.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, (land) => land.documents, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], DocumentRecord.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "documentName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_enum_1.DocumentType,
        default: status_enum_1.DocumentType.SALE_DEED,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DocumentRecord.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "storageKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "s3Url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, default: 'application/pdf' }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DocumentRecord.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DocumentRecord.prototype, "documentHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DocumentRecord.prototype, "uploadedByOfficerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => officer_entity_1.Officer, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'uploadedByOfficerId' }),
    __metadata("design:type", officer_entity_1.Officer)
], DocumentRecord.prototype, "uploadedByOfficer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_enum_1.VerificationStatus,
        default: status_enum_1.VerificationStatus.VERIFIED,
    }),
    __metadata("design:type", String)
], DocumentRecord.prototype, "verificationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DocumentRecord.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DocumentRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DocumentRecord.prototype, "updatedAt", void 0);
exports.DocumentRecord = DocumentRecord = __decorate([
    (0, typeorm_1.Entity)('document_records')
], DocumentRecord);
//# sourceMappingURL=document-record.entity.js.map