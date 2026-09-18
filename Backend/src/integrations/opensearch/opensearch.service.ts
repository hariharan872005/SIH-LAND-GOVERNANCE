import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: Client;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const node = this.configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200');
    const username = this.configService.get<string>('OPENSEARCH_USERNAME', 'admin');
    const password = this.configService.get<string>('OPENSEARCH_PASSWORD', 'admin');

    try {
      this.client = new Client({
        node,
        auth: {
          username,
          password,
        },
        ssl: {
          rejectUnauthorized: false,
        },
      });

      this.client.ping().then(() => {
        this.isConnected = true;
        this.logger.log(`Connected to OpenSearch Cluster on ${node}`);
      }).catch((err) => {
        this.logger.warn(`OpenSearch cluster deferred: ${err.message}`);
      });
    } catch (err) {
      this.logger.warn(`OpenSearch init warning: ${err.message}`);
    }
  }

  async indexLandParcel(land: any) {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.index({
        index: 'land_parcels',
        id: land.landId,
        body: {
          landId: land.landId,
          surveyNumber: land.surveyNumber,
          ownerName: land.currentOwner?.name || '',
          state: land.stateName || '',
          district: land.districtName || '',
          taluk: land.talukName || '',
          village: land.villageName || '',
          landType: land.landType,
          status: land.status,
          updatedAt: new Date().toISOString(),
        },
        refresh: true,
      });
    } catch {
      // Non-blocking search index
    }
  }

  async searchLands(query: string, limit = 20): Promise<string[]> {
    if (!this.isConnected || !this.client) return [];
    try {
      const res = await this.client.search({
        index: 'land_parcels',
        body: {
          size: limit,
          query: {
            multi_match: {
              query,
              fields: ['landId^3', 'surveyNumber^2', 'ownerName', 'village', 'taluk', 'district'],
              fuzziness: 'AUTO',
            },
          },
        },
      });
      return res.body.hits.hits.map((h: any) => h._id);
    } catch {
      return [];
    }
  }
}
