"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OpenSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const opensearch_1 = require("@opensearch-project/opensearch");
let OpenSearchService = OpenSearchService_1 = class OpenSearchService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OpenSearchService_1.name);
        this.isConnected = false;
    }
    onModuleInit() {
        const node = this.configService.get('OPENSEARCH_NODE', 'http://localhost:9200');
        const username = this.configService.get('OPENSEARCH_USERNAME', 'admin');
        const password = this.configService.get('OPENSEARCH_PASSWORD', 'admin');
        try {
            this.client = new opensearch_1.Client({
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
        }
        catch (err) {
            this.logger.warn(`OpenSearch init warning: ${err.message}`);
        }
    }
    async indexLandParcel(land) {
        if (!this.isConnected || !this.client)
            return;
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
        }
        catch {
        }
    }
    async searchLands(query, limit = 20) {
        if (!this.isConnected || !this.client)
            return [];
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
            return res.body.hits.hits.map((h) => h._id);
        }
        catch {
            return [];
        }
    }
};
exports.OpenSearchService = OpenSearchService;
exports.OpenSearchService = OpenSearchService = OpenSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenSearchService);
//# sourceMappingURL=opensearch.service.js.map