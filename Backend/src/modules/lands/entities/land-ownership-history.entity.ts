import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LandParcel } from './land-parcel.entity';

@Entity('land_ownership_history')
export class LandOwnershipHistory {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 64 })
  @Index()
  ownerId: string;

  @Column({ length: 128 })
  ownerName: string;

  @Column({ length: 128, nullable: true })
  ownerIdHash: string;

  @Column({ type: 'date', nullable: true })
  ownershipStartDate: Date;

  @Column({ type: 'date', nullable: true })
  ownershipEndDate: Date | null;

  @Column({ length: 64, default: 'SALE' })
  acquisitionType: string;

  @Column({ length: 64, nullable: true })
  @Index()
  transactionId: string;

  @Column({ default: false })
  @Index()
  isCurrent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
