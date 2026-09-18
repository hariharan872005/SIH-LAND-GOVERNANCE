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
import { VerificationStatus } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Department } from '../../organization/entities/department.entity';
import { Officer } from '../../organization/entities/officer.entity';

@Entity('land_verifications')
export class LandVerification {
  @PrimaryColumn({ length: 64 })
  id: string; // verificationId

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, (land) => land.verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 64 })
  @Index()
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ length: 64, nullable: true })
  @Index()
  officerId: string;

  @ManyToOne(() => Officer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'officerId' })
  officer: Officer;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  @Index()
  status: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ length: 128, nullable: true })
  referenceDocketNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
