import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandParcel } from './entities/land-parcel.entity';
import { LandOwner } from './entities/land-owner.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { LandOwnershipHistory } from './entities/land-ownership-history.entity';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LandParcel, LandOwner, LandOwnershipHistory, LandVerification])],
  controllers: [LandsController],
  providers: [LandsService],
  exports: [LandsService],
})
export class LandsModule {}
