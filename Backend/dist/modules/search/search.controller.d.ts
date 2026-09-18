import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(q: string, limit?: number): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("../lands/entities/land-parcel.entity").LandParcel> | import("../lands/entities/land-parcel.entity").LandParcel[]>;
}
