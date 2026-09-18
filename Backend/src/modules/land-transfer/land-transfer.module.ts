import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandOwner } from '../lands/entities/land-owner.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { LandTransferTransaction } from './entities/land-transfer-transaction.entity';
import { LandTransfer } from './entities/land-transfer.entity';
import { LandOwnershipHistory } from '../lands/entities/land-ownership-history.entity';
import { OutboxEvent } from '../../integrations/kafka/entities/outbox-event.entity';
import { IdempotencyRecord } from '../../common/entities/idempotency-record.entity';
import { LandTransferService } from './land-transfer.service';
import { LandTransferController } from './land-transfer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandParcel,
      LandOwner,
      LandVerification,
      LandTransferTransaction,
      LandTransfer,
      LandOwnershipHistory,
      OutboxEvent,
      IdempotencyRecord,
    ]),
  ],
  controllers: [LandTransferController],
  providers: [LandTransferService],
  exports: [LandTransferService],
})
export class LandTransferModule {}
