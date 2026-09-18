import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('idempotency_records')
export class IdempotencyRecord {
  @PrimaryColumn({ length: 128 })
  idempotencyKey: string;

  @Column({ length: 255 })
  requestPath: string;

  @Column({ type: 'int' })
  responseStatus: number;

  @Column({ type: 'jsonb' })
  responseBody: any;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
