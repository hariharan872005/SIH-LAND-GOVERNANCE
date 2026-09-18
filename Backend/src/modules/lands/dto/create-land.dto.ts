import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LandType, OwnershipType } from '../../../common/constants/status.enum';

export class CreateLandDto {
  @ApiProperty({ description: 'Unique National Land ID', example: 'TN-CHE-105' })
  @IsString()
  @IsNotEmpty()
  landId: string;

  @ApiProperty({ description: 'Cadastral Survey Number', example: '442/1A' })
  @IsString()
  @IsNotEmpty()
  surveyNumber: string;

  @ApiPropertyOptional({ description: 'Sub-Division identifier', example: '1' })
  @IsOptional()
  @IsString()
  subdivisionNumber?: string;

  @ApiProperty({ description: 'State ID (Must match Tahsildar jurisdiction)', example: 'state_tn' })
  @IsString()
  @IsNotEmpty()
  stateId: string;

  @ApiProperty({ description: 'District ID', example: 'dist_che' })
  @IsString()
  @IsNotEmpty()
  districtId: string;

  @ApiProperty({ description: 'Taluk ID', example: 'taluk_amb' })
  @IsString()
  @IsNotEmpty()
  talukId: string;

  @ApiProperty({ description: 'Village ID', example: 'vil_amb_ot' })
  @IsString()
  @IsNotEmpty()
  villageId: string;

  @ApiProperty({ enum: LandType, default: LandType.COMMERCIAL })
  @IsEnum(LandType)
  landType: LandType;

  @ApiPropertyOptional({ default: 'General Revenue Land' })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiProperty({ description: 'Registered Area in Acres', example: 2.5 })
  @IsNumber()
  @Min(0.01)
  registeredArea: number;

  @ApiProperty({ description: 'Estimated Market Value in INR', example: 85000000 })
  @IsNumber()
  marketValueINR: number;

  @ApiProperty({ description: 'Full Legal Name of Initial Title Holder', example: 'V. Sundaram & Sons Enterprises' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ description: 'PAN, Aadhaar, or CIN Identifier Reference', example: 'PAN:AAACS9841K' })
  @IsString()
  @IsNotEmpty()
  ownerIdHash: string;

  @ApiProperty({ enum: OwnershipType, default: OwnershipType.CORPORATE })
  @IsEnum(OwnershipType)
  ownershipType: OwnershipType;

  @ApiPropertyOptional({ description: 'Initial Reference Docket / Patta', example: 'TN-REV-PATTA-8842/2026' })
  @IsOptional()
  @IsString()
  existingLandRecordRef?: string;
}
