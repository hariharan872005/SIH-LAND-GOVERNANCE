import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalTwinService } from './digital-twin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';

@ApiTags('Digital Twins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('digital-twins')
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Get(':landId')
  @ApiOperation({ summary: 'Get unified Digital Twin aggregate (PostgreSQL + PostGIS + Neo4j + S3 + Verification)' })
  @RequirePermissions(PermissionCode.VIEW_LAND)
  async getDigitalTwin(@Param('landId') landId: string) {
    return this.digitalTwinService.getDigitalTwin(landId);
  }
}
