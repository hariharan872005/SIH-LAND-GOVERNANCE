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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_record_entity_1 = require("./entities/audit-log-record.entity");
const uuid_1 = require("uuid");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let AuditService = AuditService_1 = class AuditService {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async logEvent(params) {
        const record = this.auditRepo.create({
            id: `aud_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
            actorId: params.actorId,
            actorName: params.actorName,
            actorRole: params.actorRole,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            previousValue: params.previousValue || null,
            newValue: params.newValue || null,
            ipAddress: params.ipAddress || '10.24.112.85 (NIC Gov Gateway)',
            userAgent: params.userAgent || 'Gov-Cadastre-Client/2.0',
            requestId: params.requestId || (0, uuid_1.v4)(),
            status: params.status || 'SUCCESS',
        });
        try {
            const saved = await this.auditRepo.save(record);
            this.logger.log(`[Audit] ${params.action} logged on ${params.entityType}:${params.entityId || 'N/A'} by ${params.actorName}`);
            return saved;
        }
        catch (err) {
            this.logger.error(`Failed to persist audit log: ${err.message}`);
            return record;
        }
    }
    async getAuditLogs(pagination, filters) {
        const qb = this.auditRepo.createQueryBuilder('audit');
        if (filters?.officerId) {
            qb.andWhere('audit.actorId = :officerId', { officerId: filters.officerId });
        }
        if (filters?.landId) {
            qb.andWhere('audit.entityId = :landId', { landId: filters.landId });
        }
        if (filters?.action) {
            qb.andWhere('audit.action = :action', { action: filters.action });
        }
        if (filters?.entityType) {
            qb.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
        }
        if (pagination.search) {
            qb.andWhere('(audit.actorName ILIKE :search OR audit.action ILIKE :search OR audit.entityId ILIKE :search)', { search: `%${pagination.search}%` });
        }
        qb.orderBy('audit.timestamp', pagination.sortOrder || 'DESC');
        qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
        qb.take(pagination.pageSize || 20);
        const [items, total] = await qb.getManyAndCount();
        return new pagination_dto_1.PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_record_entity_1.AuditLogRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map