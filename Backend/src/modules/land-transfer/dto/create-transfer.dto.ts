import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferType, OwnershipType } from '../../../common/constants/status.enum';

export class NewOwnerDto {
  @ApiProperty({ description: 'New Owner ID / Hash', example: 'P002' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({ description: 'Full Legal Name of Transferee', example: 'Lakshmi Narayanan' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiPropertyOptional({ description: 'Owner Identification Hash', example: 'PAN:ABCDE1234F' })
  @IsOptional()
  @IsString()
  ownerIdHash?: string;

  @ApiPropertyOptional({ enum: OwnershipType, default: OwnershipType.INDIVIDUAL })
  @IsOptional()
  @IsEnum(OwnershipType)
  ownershipType?: OwnershipType;
}

export class CreateTransferDto {
  @ApiProperty({ description: 'Target Land ID', example: 'TN-CHE-101' })
  @IsString()
  @IsNotEmpty()
  landId: string;

  @ApiPropertyOptional({ description: 'Current Authoritative Owner ID to be transferred from', example: 'P001' })
  @IsOptional()
  @IsString()
  previousOwnerId?: string;

  @ApiPropertyOptional({ description: 'New Owner Details object' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewOwnerDto)
  newOwner?: NewOwnerDto;

  @ApiPropertyOptional({ description: 'Full Legal Name of Transferee (New Owner)', example: 'Lakshmi Narayanan' })
  @IsOptional()
  @IsString()
  newOwnerName?: string;

  @ApiPropertyOptional({ description: 'New Owner ID Hash (PAN/CIN/Aadhaar Ref)', example: 'PAN:ABCDE1234F' })
  @IsOptional()
  @IsString()
  newOwnerIdHash?: string;

  @ApiPropertyOptional({ enum: OwnershipType, default: OwnershipType.INDIVIDUAL })
  @IsOptional()
  @IsEnum(OwnershipType)
  newOwnershipType?: OwnershipType;

  @ApiProperty({ enum: TransferType, default: TransferType.SALE })
  @IsEnum(TransferType)
  transferType: TransferType;

  @ApiProperty({ description: 'Registered Deed Docket Number', example: 'DOC/TN/AMB/1948/2026' })
  @IsString()
  @IsNotEmpty()
  deedNumber: string;

  @ApiPropertyOptional({ description: 'Registration Number', example: 'REG/SRO/4402/2026' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ description: 'Deed Registration Date', example: '2026-08-28' })
  @IsDateString()
  registrationDate: string;

  @ApiPropertyOptional({ description: 'SRO Jurisdiction Office', example: 'Sub-Registrar Office Ambattur' })
  @IsOptional()
  @IsString()
  registrationOffice?: string;

  @ApiPropertyOptional({ description: 'SRO Jurisdiction Office alias', example: 'Sub-Registrar Office Ambattur' })
  @IsOptional()
  @IsString()
  sroOffice?: string;

  @ApiPropertyOptional({ description: 'Unique Transaction Reference', example: 'TX-1001' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ description: 'Total Transaction Consideration in INR (Required for SALE)', example: 95000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  considerationAmount?: number;

  @ApiPropertyOptional({ description: 'Total Transaction Consideration in INR alias', example: 95000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  considerationAmountINR?: number;

  @ApiPropertyOptional({ description: 'Document Reference IDs', example: ['doc_sale_deed_101'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentReferences?: string[];

  @ApiPropertyOptional({ description: 'Registration Ledger Remarks', example: 'Title conveyance under Indian Registration Act.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export { CreateTransferDto as CreateLandTransferDto };
