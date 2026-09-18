import { AdministrativeScopeService } from './administrative-scope.service';
export declare class AdministrativeScopeController {
    private readonly scopeService;
    constructor(scopeService: AdministrativeScopeService);
    getStates(): Promise<import("./entities/state.entity").State[]>;
    getDistricts(stateId: string): Promise<import("./entities/district.entity").District[]>;
    getTaluks(districtId: string): Promise<import("./entities/taluk.entity").Taluk[]>;
    getVillages(talukId: string): Promise<import("./entities/village.entity").Village[]>;
}
