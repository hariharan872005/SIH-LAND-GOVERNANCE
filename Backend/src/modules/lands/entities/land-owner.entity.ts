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
import { OwnershipType } from '../../../common/constants/status.enum';
import { LandParcel } from './land-parcel.entity';

@Entity('land_owners')
export class LandOwner {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. own_p101_1

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, (land) => land.owners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 128 })
  ownerName: string;

  @Column({ length: 128 })
  @Index()
  ownerIdHash: string; // PAN/Aadhaar/CIN hash reference

  @Column({ length: 32, nullable: true })
  maskedAadhaarOrId: string;

  @Column({ type: 'enum', enum: OwnershipType, default: OwnershipType.INDIVIDUAL })
  ownershipType: OwnershipType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.0 })
  ownershipPercentage: number;

  @Column({ default: true })
  @Index()
  isCurrentOwner: boolean;

  @Column({ type: 'date', nullable: true })
  acquiredDate: Date;

  @Column({ type: 'date', nullable: true })
  relinquishedDate: Date;

  @Column({ length: 64, nullable: true })
  deedRegistrationNumber: string;

  @Column({ length: 64, nullable: true })
  mutationDocketNumber: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  considerationAmountINR: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
