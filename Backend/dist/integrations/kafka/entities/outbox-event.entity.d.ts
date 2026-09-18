export declare class OutboxEvent {
    id: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: any;
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    retryCount: number;
    error: string;
    createdAt: Date;
    processedAt: Date;
}
