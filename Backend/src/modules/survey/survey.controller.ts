import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SurveyService } from './survey.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cadastral Survey & PostGIS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('submit-verification')
  @ApiOperation({ summary: 'Submit DGPS boundary demarcation and verify survey' })
  @RequireRoles(
    OfficerRole.TAHSILDAR,
    OfficerRole.SUB_REGISTRAR,
    OfficerRole.SURVEYOR,
    OfficerRole.REVENUE_OFFICER,
    OfficerRole.SUPER_ADMIN,
  )
  @RequirePermissions(PermissionCode.SUBMIT_SURVEY_VERIFICATION)
  async submitSurvey(
    @Body() dto: SubmitSurveyDto,
    @CurrentUser() surveyor: AuthenticatedUser,
  ) {
    return this.surveyService.submitSurveyVerification(dto, surveyor);
  }
}
