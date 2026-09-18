import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Taluk } from './entities/taluk.entity';
import { Village } from './entities/village.entity';
export declare class AdministrativeScopeService {
    private readonly stateRepo;
    private readonly districtRepo;
    private readonly talukRepo;
    private readonly villageRepo;
    constructor(stateRepo: Repository<State>, districtRepo: Repository<District>, talukRepo: Repository<Taluk>, villageRepo: Repository<Village>);
    getAllStates(): Promise<State[]>;
    getDistrictsByState(stateId: string): Promise<District[]>;
    getTaluksByDistrict(districtId: string): Promise<Taluk[]>;
    getVillagesByTaluk(talukId: string): Promise<Village[]>;
    resolveHierarchyNames(stateId: string, districtId?: string, talukId?: string, villageId?: string): Promise<{
        stateName: string;
        districtName: string;
        talukName: string;
        villageName: string;
    }>;
}
