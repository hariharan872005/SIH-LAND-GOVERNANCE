import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ length: 64 })
  @Index()
  aggregateType: string; // e.g. LAND_TRANSFER

  @Column({ length: 64 })
  @Index()
  aggregateId: string; // e.g. landId or transactionId

  @Column({ length: 64 })
  @Index()
  eventType: string; // e.g. LAND_TRANSFER_COMPLETED

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ length: 16, default: 'PENDING' })
  @Index()
  status: 'PENDING' | 'PROCESSED' | 'FAILED';

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
