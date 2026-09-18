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
exports.CreateLandDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const status_enum_1 = require("../../../common/constants/status.enum");
class CreateLandDto {
}
exports.CreateLandDto = CreateLandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique National Land ID', example: 'TN-CHE-105' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "landId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cadastral Survey Number', example: '442/1A' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "surveyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sub-Division identifier', example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "subdivisionNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID (Must match Tahsildar jurisdiction)', example: 'state_tn' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'District ID', example: 'dist_che' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "districtId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Taluk ID', example: 'taluk_amb' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "talukId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Village ID', example: 'vil_amb_ot' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "villageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: status_enum_1.LandType, default: status_enum_1.LandType.COMMERCIAL }),
    (0, class_validator_1.IsEnum)(status_enum_1.LandType),
    __metadata("design:type", String)
], CreateLandDto.prototype, "landType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'General Revenue Land' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "classification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registered Area in Acres', example: 2.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateLandDto.prototype, "registeredArea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated Market Value in INR', example: 85000000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLandDto.prototype, "marketValueINR", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full Legal Name of Initial Title Holder', example: 'V. Sundaram & Sons Enterprises' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PAN, Aadhaar, or CIN Identifier Reference', example: 'PAN:AAACS9841K' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "ownerIdHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: status_enum_1.OwnershipType, default: status_enum_1.OwnershipType.CORPORATE }),
    (0, class_validator_1.IsEnum)(status_enum_1.OwnershipType),
    __metadata("design:type", String)
], CreateLandDto.prototype, "ownershipType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial Reference Docket / Patta', example: 'TN-REV-PATTA-8842/2026' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLandDto.prototype, "existingLandRecordRef", void 0);
//# sourceMappingURL=create-land.dto.js.map