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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const survey_service_1 = require("./survey.service");
const submit_survey_dto_1 = require("./dto/submit-survey.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SurveyController = class SurveyController {
    constructor(surveyService) {
        this.surveyService = surveyService;
    }
    async submitSurvey(dto, surveyor) {
        return this.surveyService.submitSurveyVerification(dto, surveyor);
    }
};
exports.SurveyController = SurveyController;
__decorate([
    (0, common_1.Post)('submit-verification'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit DGPS boundary demarcation and verify survey' }),
    (0, permissions_decorator_1.RequireRoles)(roles_enum_1.OfficerRole.TAHSILDAR, roles_enum_1.OfficerRole.SUB_REGISTRAR, roles_enum_1.OfficerRole.SURVEYOR, roles_enum_1.OfficerRole.REVENUE_OFFICER, roles_enum_1.OfficerRole.SUPER_ADMIN),
    (0, permissions_decorator_1.RequirePermissions)(permissions_enum_1.PermissionCode.SUBMIT_SURVEY_VERIFICATION),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_survey_dto_1.SubmitSurveyDto, Object]),
    __metadata("design:returntype", Promise)
], SurveyController.prototype, "submitSurvey", null);
exports.SurveyController = SurveyController = __decorate([
    (0, swagger_1.ApiTags)('Cadastral Survey & PostGIS'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('surveys'),
    __metadata("design:paramtypes", [survey_service_1.SurveyService])
], SurveyController);
//# sourceMappingURL=survey.controller.js.map