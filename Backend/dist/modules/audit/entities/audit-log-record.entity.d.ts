export declare class AuditLogRecord {
    id: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    previousValue: any;
    newValue: any;
    ipAddress: string;
    userAgent: string;
    requestId: string;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING';
    timestamp: Date;
}
