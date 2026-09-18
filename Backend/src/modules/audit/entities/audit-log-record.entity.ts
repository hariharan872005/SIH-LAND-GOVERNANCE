import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogRecord {
  @PrimaryColumn({ length: 64 })
  id: string; // auditId

  @Column({ length: 64 })
  @Index()
  actorId: string; // officerId

  @Column({ length: 128 })
  actorName: string;

  @Column({ length: 64 })
  actorRole: string;

  @Column({ length: 64 })
  @Index()
  action: string; // e.g. LAND_CREATED, OWNER_TRANSFERRED, etc.

  @Column({ length: 64 })
  @Index()
  entityType: string; // e.g. LAND, TRANSACTION, OFFICER, VERIFICATION

  @Column({ length: 64, nullable: true })
  @Index()
  entityId: string; // e.g. TN-CHE-101

  @Column({ type: 'jsonb', nullable: true })
  previousValue: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  @Column({ length: 64, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column({ length: 64, nullable: true })
  requestId: string;

  @Column({ length: 16, default: 'SUCCESS' })
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
