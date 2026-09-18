import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    health(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
    };
    live(): {
        status: string;
        uptime: number;
    };
    ready(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
}
