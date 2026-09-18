import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class OpenSearchService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private client;
    private isConnected;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    indexLandParcel(land: any): Promise<void>;
    searchLands(query: string, limit?: number): Promise<string[]>;
}
