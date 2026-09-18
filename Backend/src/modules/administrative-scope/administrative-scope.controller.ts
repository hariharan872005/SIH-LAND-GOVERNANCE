import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdministrativeScopeService } from './administrative-scope.service';
import { Public } from '../../common/decorators/permissions.decorator';

@ApiTags('Administrative Scope')
@Controller('administrative-scope')
export class AdministrativeScopeController {
  constructor(private readonly scopeService: AdministrativeScopeService) {}

  @Public()
  @Get('states')
  @ApiOperation({ summary: 'Get all Indian States / UTs' })
  async getStates() {
    return this.scopeService.getAllStates();
  }

  @Public()
  @Get('states/:stateId/districts')
  @ApiOperation({ summary: 'Get districts within a State' })
  async getDistricts(@Param('stateId') stateId: string) {
    return this.scopeService.getDistrictsByState(stateId);
  }

  @Public()
  @Get('districts/:districtId/taluks')
  @ApiOperation({ summary: 'Get taluks / tehsils within a District' })
  async getTaluks(@Param('districtId') districtId: string) {
    return this.scopeService.getTaluksByDistrict(districtId);
  }

  @Public()
  @Get('taluks/:talukId/villages')
  @ApiOperation({ summary: 'Get villages / wards within a Taluk' })
  async getVillages(@Param('talukId') talukId: string) {
    return this.scopeService.getVillagesByTaluk(talukId);
  }
}
