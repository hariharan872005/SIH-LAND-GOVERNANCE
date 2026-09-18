import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MunicipalService } from './municipal.service';
import { VerifyMunicipalDto } from './dto/verify-municipal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Municipal & Property Tax')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('municipal')
export class MunicipalController {
  constructor(private readonly municipalService: MunicipalService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Submit municipal property assessment & tax clearance' })
  @RequireRoles(
    OfficerRole.TAHSILDAR,
    OfficerRole.SUB_REGISTRAR,
    OfficerRole.SURVEYOR,
    OfficerRole.REVENUE_OFFICER,
    OfficerRole.SUPER_ADMIN,
  )
  @RequirePermissions(PermissionCode.VERIFY_PROPERTY)
  async verifyMunicipal(
    @Body() dto: VerifyMunicipalDto,
    @CurrentUser() officer: AuthenticatedUser,
  ) {
    return this.municipalService.submitMunicipalVerification(dto, officer);
  }
}
