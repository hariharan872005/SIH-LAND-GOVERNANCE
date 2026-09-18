import { AuditService } from './audit.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(pagination: PaginationDto, officerId?: string, landId?: string, action?: string, entityType?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/audit-log-record.entity").AuditLogRecord>>;
}
