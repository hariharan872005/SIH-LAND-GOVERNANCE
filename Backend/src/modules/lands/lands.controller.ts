import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JurisdictionScopeGuard } from '../../common/guards/jurisdiction-scope.guard';
import { RequirePermissions, RequireRoles, RequireJurisdiction } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus } from '../../common/constants/status.enum';

@ApiTags('Land Parcels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post()
  @ApiOperation({ summary: 'Primary Land Parcel Creation' })
  @RequireRoles(
    OfficerRole.TAHSILDAR,
    OfficerRole.SUB_REGISTRAR,
    OfficerRole.SURVEYOR,
    OfficerRole.REVENUE_OFFICER,
    OfficerRole.SUPER_ADMIN,
  )
  @RequireJurisdiction()
  async createLand(
    @Body() createLandDto: CreateLandDto,
    @CurrentUser() officer: AuthenticatedUser,
  ) {
    return this.landsService.createParcelByTahsildar(createLandDto, officer);
  }

  @Get()
  @ApiOperation({ summary: 'Query land parcels with geographic scope enforcement and pagination' })
  @RequirePermissions(PermissionCode.VIEW_LAND)
  async getLands(
    @Query() pagination: PaginationDto,
    @Query('stateId') stateId?: string,
    @Query('districtId') districtId?: string,
    @Query('talukId') talukId?: string,
    @Query('status') status?: LandStatus,
    @Query('landType') landType?: string,
    @CurrentUser() officer?: AuthenticatedUser,
  ) {
    return this.landsService.getLandParcels(
      pagination,
      { stateId, districtId, talukId, status, landType },
      officer,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Land Parcel Details by ID or Land ID' })
  @RequirePermissions(PermissionCode.VIEW_LAND)
  async getLandById(@Param('id') id: string) {
    return this.landsService.getLandById(id);
  }
}
