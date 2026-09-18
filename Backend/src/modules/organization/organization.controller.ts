import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organization & Governance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  // Departments
  @Get('departments')
  @ApiOperation({ summary: 'List all dynamic departments' })
  async getDepartments() {
    return this.orgService.getDepartments();
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create department (Super Admin Only)' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_DEPARTMENTS)
  async createDepartment(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.createDepartment(body, user);
  }

  @Patch('departments/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle department status' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_DEPARTMENTS)
  async toggleDepartmentStatus(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.toggleDepartmentStatus(id, user);
  }

  // Designations
  @Get('designations')
  @ApiOperation({ summary: 'List designations by department' })
  async getDesignations(@Query('departmentId') departmentId?: string) {
    return this.orgService.getDesignations(departmentId);
  }

  @Post('designations')
  @ApiOperation({ summary: 'Create designation' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_DESIGNATIONS)
  async createDesignation(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.createDesignation(body, user);
  }

  // Officers
  @Get('officers')
  @ApiOperation({ summary: 'List government officers with scope' })
  async getOfficers(
    @Query() pagination: PaginationDto,
    @Query('departmentId') departmentId?: string,
    @Query('stateId') stateId?: string,
  ) {
    return this.orgService.getOfficers(pagination, { departmentId, stateId });
  }

  @Post('officers')
  @ApiOperation({ summary: 'Onboard new officer' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async createOfficer(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.createOfficer(body, user);
  }

  @Put('officers/:id')
  @ApiOperation({ summary: 'Update officer profile credentials and scope' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async updateOfficerPut(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.updateOfficer(id, body, user);
  }

  @Patch('officers/:id')
  @ApiOperation({ summary: 'Update officer profile credentials and scope' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async updateOfficerPatch(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.updateOfficer(id, body, user);
  }

  @Post('officers/:id/reset-access')
  @ApiOperation({ summary: 'Reset officer login password' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async resetOfficerAccess(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.resetOfficerAccess(id, user);
  }

  @Patch('officers/:id/toggle-status')
  @ApiOperation({ summary: 'Activate / Deactivate officer' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async toggleOfficerStatus(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.toggleOfficerStatus(id, user);
  }

  @Delete('officers/:id')
  @ApiOperation({ summary: 'Delete officer login ID (Super Admin Only)' })
  @RequireRoles(OfficerRole.SUPER_ADMIN)
  @RequirePermissions(PermissionCode.MANAGE_USERS)
  async deleteOfficer(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orgService.deleteOfficer(id, user);
  }

  // Roles & Permissions
  @Get('roles')
  @ApiOperation({ summary: 'List all system and custom roles' })
  async getRoles() {
    return this.orgService.getRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all system permission definitions' })
  async getPermissions() {
    return this.orgService.getPermissions();
  }
}
