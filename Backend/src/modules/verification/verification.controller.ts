import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ReopenVerificationDto } from './dto/reopen-verification.dto';

@ApiTags('Verification Matrix')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('verifications')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('land/:landId')
  @ApiOperation({ summary: 'Get normalized LAND_VERIFICATION records for a parcel' })
  @RequirePermissions(PermissionCode.VIEW_LAND)
  async getVerifications(@Param('landId') landId: string) {
    return this.verificationService.getVerificationsByLand(landId);
  }

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Existing Owner / Registration Record' })
  @RequireRoles(
    OfficerRole.TAHSILDAR,
    OfficerRole.SUB_REGISTRAR,
    OfficerRole.SURVEYOR,
    OfficerRole.REVENUE_OFFICER,
    OfficerRole.SUPER_ADMIN,
  )
  @RequirePermissions(PermissionCode.VERIFY_REGISTRATION)
  @ApiResponse({ status: 200, description: 'Registration verification successful' })
  @ApiResponse({ status: 409, description: 'REGISTRATION_ALREADY_VERIFIED - Duplicate verification forbidden' })
  async verifyRegistration(
    @Body() dto: VerifyRegistrationDto,
    @CurrentUser() officer: AuthenticatedUser,
  ) {
    return this.verificationService.verifyRegistration(dto, officer);
  }

  @Post('reopen')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reopen a verified record for correction / re-verification (Controlled Workflow)' })
  @RequirePermissions(PermissionCode.VERIFY_REGISTRATION, PermissionCode.VERIFY_OWNERSHIP, PermissionCode.MANAGE_SCOPE)
  async reopenVerification(
    @Body() dto: ReopenVerificationDto,
    @CurrentUser() officer: AuthenticatedUser,
  ) {
    return this.verificationService.reopenVerification(dto, officer);
  }

  @Post('flag-correction')
  @ApiOperation({ summary: 'Flag defect / request correction or reject verification' })
  @RequirePermissions(
    PermissionCode.VERIFY_OWNERSHIP,
    PermissionCode.SUBMIT_SURVEY_VERIFICATION,
    PermissionCode.VERIFY_REGISTRATION,
    PermissionCode.VERIFY_PROPERTY,
  )
  async flagCorrection(
    @Body()
    body: {
      landId: string;
      departmentId: string;
      action: 'REQUIRES_CORRECTION' | 'REJECTED';
      reason: string;
    },
    @CurrentUser() officer: AuthenticatedUser,
  ) {
    return this.verificationService.flagCorrectionOrReject(
      body.landId,
      body.departmentId,
      body.action,
      body.reason,
      officer,
    );
  }
}
