import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyRegistrationDto {
  @ApiProperty({ description: 'National Land Parcel ID or database ID', example: 'TN-CHE-101' })
  @IsNotEmpty()
  @IsString()
  landId: string;

  @ApiProperty({ description: 'Verification remarks or SRO notes', example: 'Registration deed verified in sub-registrar ledger.', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
