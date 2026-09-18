import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Taluk } from './entities/taluk.entity';
import { Village } from './entities/village.entity';
import { AdministrativeScopeService } from './administrative-scope.service';
import { AdministrativeScopeController } from './administrative-scope.controller';

@Module({
  imports: [TypeOrmModule.forFeature([State, District, Taluk, Village])],
  controllers: [AdministrativeScopeController],
  providers: [AdministrativeScopeService],
  exports: [AdministrativeScopeService],
})
export class AdministrativeScopeModule {}
