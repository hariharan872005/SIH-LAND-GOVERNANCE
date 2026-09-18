import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Officer } from './entities/officer.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { State } from '../administrative-scope/entities/state.entity';
import { District } from '../administrative-scope/entities/district.entity';
import { Taluk } from '../administrative-scope/entities/taluk.entity';
import { Village } from '../administrative-scope/entities/village.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Designation,
      Officer,
      Role,
      Permission,
      State,
      District,
      Taluk,
      Village,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
