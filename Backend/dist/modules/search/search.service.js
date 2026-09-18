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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const opensearch_service_1 = require("../../integrations/opensearch/opensearch.service");
const lands_service_1 = require("../lands/lands.service");
let SearchService = class SearchService {
    constructor(openSearchService, landsService) {
        this.openSearchService = openSearchService;
        this.landsService = landsService;
    }
    async searchCadastre(query, limit = 20) {
        const landIds = await this.openSearchService.searchLands(query, limit);
        if (landIds.length === 0) {
            return this.landsService.getLandParcels({ search: query, page: 1, pageSize: limit });
        }
        const parcels = await Promise.all(landIds.map(async (id) => {
            try {
                return await this.landsService.getLandById(id);
            }
            catch {
                return null;
            }
        }));
        return parcels.filter(Boolean);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [opensearch_service_1.OpenSearchService,
        lands_service_1.LandsService])
], SearchService);
//# sourceMappingURL=search.service.js.map