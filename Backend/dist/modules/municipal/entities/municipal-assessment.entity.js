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
exports.MunicipalAssessment = void 0;
const typeorm_1 = require("typeorm");
const land_parcel_entity_1 = require("../../lands/entities/land-parcel.entity");
let MunicipalAssessment = class MunicipalAssessment {
};
exports.MunicipalAssessment = MunicipalAssessment;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], MunicipalAssessment.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, default: 'COMMERCIAL_BUILDING' }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "propertyClassification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MunicipalAssessment.prototype, "builtUpAreaSqFt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], MunicipalAssessment.prototype, "floorsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, default: 'COMMERCIAL_OCCUPIED' }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "occupancyStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "buildingApprovalNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2026 }),
    __metadata("design:type", Number)
], MunicipalAssessment.prototype, "taxClearanceUptoYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MunicipalAssessment.prototype, "isTaxCleared", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "municipalRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], MunicipalAssessment.prototype, "verifiedByOfficerId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MunicipalAssessment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MunicipalAssessment.prototype, "updatedAt", void 0);
exports.MunicipalAssessment = MunicipalAssessment = __decorate([
    (0, typeorm_1.Entity)('municipal_assessments')
], MunicipalAssessment);
//# sourceMappingURL=municipal-assessment.entity.js.map