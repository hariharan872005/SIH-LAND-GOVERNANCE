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
exports.LandVerification = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const land_parcel_entity_1 = require("../../lands/entities/land-parcel.entity");
const department_entity_1 = require("../../organization/entities/department.entity");
const officer_entity_1 = require("../../organization/entities/officer.entity");
let LandVerification = class LandVerification {
};
exports.LandVerification = LandVerification;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], LandVerification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandVerification.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_parcel_entity_1.LandParcel, (land) => land.verifications, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'landId', referencedColumnName: 'id' }),
    __metadata("design:type", land_parcel_entity_1.LandParcel)
], LandVerification.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandVerification.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", department_entity_1.Department)
], LandVerification.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandVerification.prototype, "officerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => officer_entity_1.Officer, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'officerId' }),
    __metadata("design:type", officer_entity_1.Officer)
], LandVerification.prototype, "officer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: status_enum_1.VerificationStatus,
        default: status_enum_1.VerificationStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LandVerification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandVerification.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, nullable: true }),
    __metadata("design:type", String)
], LandVerification.prototype, "referenceDocketNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LandVerification.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LandVerification.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LandVerification.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LandVerification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LandVerification.prototype, "updatedAt", void 0);
exports.LandVerification = LandVerification = __decorate([
    (0, typeorm_1.Entity)('land_verifications')
], LandVerification);
//# sourceMappingURL=land-verification.entity.js.map