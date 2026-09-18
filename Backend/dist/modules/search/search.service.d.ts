import { OpenSearchService } from '../../integrations/opensearch/opensearch.service';
import { LandsService } from '../lands/lands.service';
export declare class SearchService {
    private readonly openSearchService;
    private readonly landsService;
    constructor(openSearchService: OpenSearchService, landsService: LandsService);
    searchCadastre(query: string, limit?: number): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("../lands/entities/land-parcel.entity").LandParcel> | import("../lands/entities/land-parcel.entity").LandParcel[]>;
}
