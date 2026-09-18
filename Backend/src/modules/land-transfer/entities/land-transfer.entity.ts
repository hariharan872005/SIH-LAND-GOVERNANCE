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

@Entity('land_transfers')
export class LandTransfer {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ length: 64, unique: true })
  @Index()
  transactionId: string;

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, (land) => land.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 64 })
  @Index()
  previousOwnerId: string;

  @Column({ length: 64 })
  @Index()
  newOwnerId: string;

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

  @Column({ length: 128 })
  registrationOffice: string;

  @Column({ length: 128, nullable: true })
  @Index()
  transactionReference: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  considerationAmount: number;

  @Column({ length: 32, default: 'COMPLETED' })
  @Index()
  status: string;

  @Column({ length: 64, nullable: true })
  verifiedBy: string;

  @ManyToOne(() => Officer, { nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifiedByOfficer: Officer;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
