import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { LandTransferTransaction } from '../land-transfer/entities/land-transfer-transaction.entity';
import { MunicipalAssessment } from '../municipal/entities/municipal-assessment.entity';
import { DocumentRecord } from '../documents/entities/document-record.entity';
import { DigitalTwinService } from './digital-twin.service';
import { DigitalTwinController } from './digital-twin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandParcel,
      LandVerification,
      LandTransferTransaction,
      MunicipalAssessment,
      DocumentRecord,
    ]),
  ],
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
