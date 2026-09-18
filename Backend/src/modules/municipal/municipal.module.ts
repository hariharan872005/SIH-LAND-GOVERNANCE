import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { MunicipalAssessment } from './entities/municipal-assessment.entity';
import { MunicipalService } from './municipal.service';
import { MunicipalController } from './municipal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LandParcel, LandVerification, MunicipalAssessment])],
  controllers: [MunicipalController],
  providers: [MunicipalService],
  exports: [MunicipalService],
})
export class MunicipalModule {}
