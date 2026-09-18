import { DigitalTwinService } from './digital-twin.service';
export declare class DigitalTwinController {
    private readonly digitalTwinService;
    constructor(digitalTwinService: DigitalTwinService);
    getDigitalTwin(landId: string): Promise<import("./digital-twin.service").UnifiedDigitalTwinResponse>;
}
