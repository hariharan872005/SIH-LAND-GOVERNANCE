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
exports.SubmitSurveyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitSurveyDto {
}
exports.SubmitSurveyDto = SubmitSurveyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target Land ID', example: 'TN-CHE-101' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitSurveyDto.prototype, "landId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'DGPS Field-Measured Extent in Acres', example: 2.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], SubmitSurveyDto.prototype, "measuredAreaAcres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'PostGIS Polygon Boundary Coordinates [[lng, lat], [lng, lat], ...]',
        example: [
            [80.1542, 13.1132],
            [80.1582, 13.1132],
            [80.1582, 13.1172],
            [80.1542, 13.1172],
            [80.1542, 13.1132],
        ],
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SubmitSurveyDto.prototype, "polygonCoordinates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Official Survey & DGPS Demarcation Remarks', example: 'DGPS Base Station CORS network verification complete. Vector boundary polygon points benchmarked against EPSG:4326.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitSurveyDto.prototype, "surveyRemarks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Survey Document Docket Reference', example: 'DGPS_FMB_TN-CHE-101_2026.gpkg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitSurveyDto.prototype, "surveyDocName", void 0);
//# sourceMappingURL=submit-survey.dto.js.map