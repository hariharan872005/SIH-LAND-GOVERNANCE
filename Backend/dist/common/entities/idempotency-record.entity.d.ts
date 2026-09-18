export declare class IdempotencyRecord {
    idempotencyKey: string;
    requestPath: string;
    responseStatus: number;
    responseBody: any;
    createdAt: Date;
}
