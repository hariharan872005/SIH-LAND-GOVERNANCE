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
import { LandParcel } from '../../lands/entities/land-parcel.entity';

@Entity('municipal_assessments')
export class MunicipalAssessment {
  @PrimaryColumn({ length: 64 })
  id: string; // assessmentId

  @Column({ length: 64, unique: true })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 64, unique: true })
  propertyId: string; // e.g. PROP-CHE-8842

  @Column({ length: 64, default: 'COMMERCIAL_BUILDING' })
  propertyClassification: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  builtUpAreaSqFt: number;

  @Column({ type: 'int', default: 1 })
  floorsCount: number;

  @Column({ length: 64, default: 'COMMERCIAL_OCCUPIED' })
  occupancyStatus: string;

  @Column({ length: 64, nullable: true })
  buildingApprovalNumber: string;

  @Column({ type: 'int', default: 2026 })
  taxClearanceUptoYear: number;

  @Column({ default: true })
  isTaxCleared: boolean;

  @Column({ type: 'text', nullable: true })
  municipalRemarks: string;

  @Column({ length: 64, nullable: true })
  verifiedByOfficerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
