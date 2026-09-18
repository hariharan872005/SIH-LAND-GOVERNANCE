import { Repository } from 'typeorm';
import { AuditLogRecord } from './entities/audit-log-record.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
export declare class AuditService {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: Repository<AuditLogRecord>);
    logEvent(params: {
        actorId: string;
        actorName: string;
        actorRole: string;
        action: string;
        entityType: string;
        entityId?: string;
        previousValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
        status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
    }): Promise<AuditLogRecord>;
    getAuditLogs(pagination: PaginationDto, filters?: {
        officerId?: string;
        landId?: string;
        action?: string;
        entityType?: string;
    }): Promise<PaginatedResult<AuditLogRecord>>;
}
