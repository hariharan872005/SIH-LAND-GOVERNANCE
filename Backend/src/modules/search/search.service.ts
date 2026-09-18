import { Injectable } from '@nestjs/common';
import { OpenSearchService } from '../../integrations/opensearch/opensearch.service';
import { LandsService } from '../lands/lands.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly openSearchService: OpenSearchService,
    private readonly landsService: LandsService,
  ) {}

  async searchCadastre(query: string, limit = 20) {
    const landIds = await this.openSearchService.searchLands(query, limit);

    if (landIds.length === 0) {
      // Fallback to PostgreSQL indexed search
      return this.landsService.getLandParcels({ search: query, page: 1, pageSize: limit });
    }

    const parcels = await Promise.all(
      landIds.map(async (id) => {
        try {
          return await this.landsService.getLandById(id);
        } catch {
          return null;
        }
      }),
    );

    return parcels.filter(Boolean);
  }
}
