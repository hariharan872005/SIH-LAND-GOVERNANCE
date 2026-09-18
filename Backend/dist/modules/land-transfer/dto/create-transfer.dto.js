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
exports.CreateLandTransferDto = exports.CreateTransferDto = exports.NewOwnerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const status_enum_1 = require("../../../common/constants/status.enum");
class NewOwnerDto {
}
exports.NewOwnerDto = NewOwnerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New Owner ID / Hash', example: 'P002' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NewOwnerDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full Legal Name of Transferee', example: 'Lakshmi Narayanan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NewOwnerDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Owner Identification Hash', example: 'PAN:ABCDE1234F' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewOwnerDto.prototype, "ownerIdHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: status_enum_1.OwnershipType, default: status_enum_1.OwnershipType.INDIVIDUAL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(status_enum_1.OwnershipType),
    __metadata("design:type", String)
], NewOwnerDto.prototype, "ownershipType", void 0);
class CreateTransferDto {
}
exports.CreateTransferDto = CreateTransferDto;
exports.CreateLandTransferDto = CreateTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target Land ID', example: 'TN-CHE-101' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "landId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current Authoritative Owner ID to be transferred from', example: 'P001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "previousOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New Owner Details object' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewOwnerDto),
    __metadata("design:type", NewOwnerDto)
], CreateTransferDto.prototype, "newOwner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full Legal Name of Transferee (New Owner)', example: 'Lakshmi Narayanan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "newOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New Owner ID Hash (PAN/CIN/Aadhaar Ref)', example: 'PAN:ABCDE1234F' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "newOwnerIdHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: status_enum_1.OwnershipType, default: status_enum_1.OwnershipType.INDIVIDUAL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(status_enum_1.OwnershipType),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "newOwnershipType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: status_enum_1.TransferType, default: status_enum_1.TransferType.SALE }),
    (0, class_validator_1.IsEnum)(status_enum_1.TransferType),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "transferType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registered Deed Docket Number', example: 'DOC/TN/AMB/1948/2026' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "deedNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Registration Number', example: 'REG/SRO/4402/2026' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "registrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deed Registration Date', example: '2026-08-28' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "registrationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SRO Jurisdiction Office', example: 'Sub-Registrar Office Ambattur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "registrationOffice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SRO Jurisdiction Office alias', example: 'Sub-Registrar Office Ambattur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "sroOffice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unique Transaction Reference', example: 'TX-1001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total Transaction Consideration in INR (Required for SALE)', example: 95000000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "considerationAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total Transaction Consideration in INR alias', example: 95000000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "considerationAmountINR", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Document Reference IDs', example: ['doc_sale_deed_101'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTransferDto.prototype, "documentReferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Registration Ledger Remarks', example: 'Title conveyance under Indian Registration Act.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "remarks", void 0);
//# sourceMappingURL=create-transfer.dto.js.map