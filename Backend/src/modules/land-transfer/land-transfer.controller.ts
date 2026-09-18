import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { LandTransferService } from './land-transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/constants/permissions.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Land Transfers & Deeds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class LandTransferController {
  constructor(private readonly transferService: LandTransferService) {}

  @Post(['land-transfers', 'transfers'])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Update / Transfer Land Ownership' })
  @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'Unique Key for transfer request idempotency' })
  @RequireRoles(
    OfficerRole.TAHSILDAR,
    OfficerRole.SUB_REGISTRAR,
    OfficerRole.SURVEYOR,
    OfficerRole.REVENUE_OFFICER,
    OfficerRole.SUPER_ADMIN,
  )
  @RequirePermissions(PermissionCode.CREATE_TRANSFER)
  @ApiResponse({ status: 201, description: 'Ownership transfer successful' })
  @ApiResponse({ status: 409, description: 'OWNER_STATE_CHANGED - Current ownership mismatch' })
  async executeTransfer(
    @Body() dto: CreateTransferDto,
    @CurrentUser() subRegistrar: AuthenticatedUser,
    @Headers() headers: Record<string, string>,
  ) {
    const idempotencyKey = headers['idempotency-key'] || headers['x-idempotency-key'];
    return this.transferService.executeOwnershipTransfer(dto, subRegistrar, idempotencyKey);
  }

  @Get(['land-transfers/land/:landId', 'transfers/land/:landId'])
  @ApiOperation({ summary: 'Get registered deed transfers for a land parcel' })
  @RequirePermissions(PermissionCode.VIEW_TRANSFER_HISTORY)
  async getTransfers(@Param('landId') landId: string) {
    return this.transferService.getTransfersByLand(landId);
  }

  @Get(['land-transfers/history/:landId', 'transfers/history/:landId'])
  @ApiOperation({ summary: 'Get complete ownership history for a land parcel' })
  @RequirePermissions(PermissionCode.VIEW_TRANSFER_HISTORY, PermissionCode.VIEW_OWNERSHIP)
  async getOwnershipHistory(@Param('landId') landId: string) {
    return this.transferService.getOwnershipHistory(landId);
  }
}
