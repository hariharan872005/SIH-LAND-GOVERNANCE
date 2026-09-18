import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReopenVerificationDto {
  @ApiProperty({ description: 'National Land Parcel ID or database ID', example: 'TN-CHE-101' })
  @IsNotEmpty()
  @IsString()
  landId: string;

  @ApiProperty({ description: 'Department ID to reopen', example: 'dept_reg_03', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: 'Reason for reopening / requesting correction', example: 'Discrepancy identified in consideration amount.' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
