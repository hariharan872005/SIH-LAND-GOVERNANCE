import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogRecord } from './entities/audit-log-record.entity';
import { v4 as uuidv4 } from 'uuid';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogRecord)
    private readonly auditRepo: Repository<AuditLogRecord>,
  ) {}

  async logEvent(params: {
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
  }): Promise<AuditLogRecord> {
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
      requestId: params.requestId || uuidv4(),
      status: params.status || 'SUCCESS',
    });

    try {
      const saved = await this.auditRepo.save(record);
      this.logger.log(`[Audit] ${params.action} logged on ${params.entityType}:${params.entityId || 'N/A'} by ${params.actorName}`);
      return saved;
    } catch (err) {
      this.logger.error(`Failed to persist audit log: ${err.message}`);
      return record;
    }
  }

  async getAuditLogs(
    pagination: PaginationDto,
    filters?: {
      officerId?: string;
      landId?: string;
      action?: string;
      entityType?: string;
    },
  ): Promise<PaginatedResult<AuditLogRecord>> {
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
      qb.andWhere(
        '(audit.actorName ILIKE :search OR audit.action ILIKE :search OR audit.entityId ILIKE :search)',
        { search: `%${pagination.search}%` },
      );
    }

    qb.orderBy('audit.timestamp', pagination.sortOrder || 'DESC');
    qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
    qb.take(pagination.pageSize || 20);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
  }
}
