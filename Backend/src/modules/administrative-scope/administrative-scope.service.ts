import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Taluk } from './entities/taluk.entity';
import { Village } from './entities/village.entity';

@Injectable()
export class AdministrativeScopeService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(Taluk)
    private readonly talukRepo: Repository<Taluk>,
    @InjectRepository(Village)
    private readonly villageRepo: Repository<Village>,
  ) {}

  async getAllStates(): Promise<State[]> {
    return this.stateRepo.find({ order: { name: 'ASC' } });
  }

  async getDistrictsByState(stateId: string): Promise<District[]> {
    return this.districtRepo.find({
      where: { stateId },
      order: { name: 'ASC' },
    });
  }

  async getTaluksByDistrict(districtId: string): Promise<Taluk[]> {
    return this.talukRepo.find({
      where: { districtId },
      order: { name: 'ASC' },
    });
  }

  async getVillagesByTaluk(talukId: string): Promise<Village[]> {
    return this.villageRepo.find({
      where: { talukId },
      order: { name: 'ASC' },
    });
  }

  async resolveHierarchyNames(stateId: string, districtId?: string, talukId?: string, villageId?: string) {
    const state = await this.stateRepo.findOne({ where: { id: stateId } });
    const district = districtId ? await this.districtRepo.findOne({ where: { id: districtId } }) : null;
    const taluk = talukId ? await this.talukRepo.findOne({ where: { id: talukId } }) : null;
    const village = villageId ? await this.villageRepo.findOne({ where: { id: villageId } }) : null;

    return {
      stateName: state?.name || stateId,
      districtName: district?.name || districtId,
      talukName: taluk?.name || talukId,
      villageName: village?.name || villageId,
    };
  }
}
