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
import { TransferType } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Officer } from '../../organization/entities/officer.entity';

@Entity('land_transfer_transactions')
export class LandTransferTransaction {
  @PrimaryColumn({ length: 64 })
  id: string; // transactionId

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, (land) => land.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 64 })
  @Index()
  fromOwnerId: string;

  @Column({ length: 128 })
  fromOwnerName: string;

  @Column({ length: 64 })
  @Index()
  toOwnerId: string;

  @Column({ length: 128 })
  toOwnerName: string;

  @Column({ length: 128 })
  toOwnerIdHash: string;

  @Column({
    type: 'enum',
    enum: TransferType,
    default: TransferType.SALE,
  })
  transferType: TransferType;

  @Column({ length: 64, unique: true })
  deedNumber: string;

  @Column({ length: 64 })
  registrationNumber: string;

  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  considerationAmountINR: number;

  @Column({ length: 128 })
  subRegistrarOffice: string;

  @Column({ length: 32, default: 'COMPLETED' })
  @Index()
  status: string;

  @Column({ length: 64, nullable: true })
  createdByOfficerId: string;

  @ManyToOne(() => Officer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByOfficerId' })
  approvedByOfficer: Officer;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
