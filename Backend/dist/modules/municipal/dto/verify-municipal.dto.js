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
exports.VerifyMunicipalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class VerifyMunicipalDto {
}
exports.VerifyMunicipalDto = VerifyMunicipalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target Land ID', example: 'TN-CHE-101' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMunicipalDto.prototype, "landId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Municipal Property Assessment ID', example: 'PROP-CHE-8842' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMunicipalDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Property Tax Clearance Upto Financial Year', example: 2026 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2020),
    __metadata("design:type", Number)
], VerifyMunicipalDto.prototype, "taxClearanceYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approved Built-Up Area in Sq Ft', example: 14500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyMunicipalDto.prototype, "builtUpAreaSqFt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of Floors', example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyMunicipalDto.prototype, "floorsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Occupancy Classification', example: 'COMMERCIAL_OCCUPIED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyMunicipalDto.prototype, "occupancyStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Municipal Remarks', example: 'Property tax cleared through 2026. Building plan approved by CMDA.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyMunicipalDto.prototype, "remarks", void 0);
//# sourceMappingURL=verify-municipal.dto.js.map