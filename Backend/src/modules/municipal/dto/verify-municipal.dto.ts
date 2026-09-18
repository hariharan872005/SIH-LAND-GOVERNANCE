import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyMunicipalDto {
  @ApiProperty({ description: 'Target Land ID', example: 'TN-CHE-101' })
  @IsString()
  @IsNotEmpty()
  landId: string;

  @ApiProperty({ description: 'Municipal Property Assessment ID', example: 'PROP-CHE-8842' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ description: 'Property Tax Clearance Upto Financial Year', example: 2026 })
  @IsNumber()
  @Min(2020)
  taxClearanceYear: number;

  @ApiPropertyOptional({ description: 'Approved Built-Up Area in Sq Ft', example: 14500 })
  @IsOptional()
  @IsNumber()
  builtUpAreaSqFt?: number;

  @ApiPropertyOptional({ description: 'Number of Floors', example: 3 })
  @IsOptional()
  @IsNumber()
  floorsCount?: number;

  @ApiPropertyOptional({ description: 'Occupancy Classification', example: 'COMMERCIAL_OCCUPIED' })
  @IsOptional()
  @IsString()
  occupancyStatus?: string;

  @ApiPropertyOptional({ description: 'Municipal Remarks', example: 'Property tax cleared through 2026. Building plan approved by CMDA.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
