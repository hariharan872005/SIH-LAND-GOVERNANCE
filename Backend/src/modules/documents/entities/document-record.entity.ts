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
import { DocumentType, VerificationStatus } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Officer } from '../../organization/entities/officer.entity';

@Entity('document_records')
export class DocumentRecord {
  @PrimaryColumn({ length: 64 })
  id: string; // docId

  @Column({ length: 64 })
  @Index()
  landId: string;

  @ManyToOne(() => LandParcel, (land) => land.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landId', referencedColumnName: 'id' })
  land: LandParcel;

  @Column({ length: 255 })
  documentName: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.SALE_DEED,
  })
  @Index()
  documentType: DocumentType;

  @Column({ length: 255 })
  storageKey: string; // S3 object key

  @Column({ length: 255, nullable: true })
  s3Url: string;

  @Column({ length: 255, default: 'application/pdf' })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSizeBytes: number;

  @Column({ length: 128 })
  @Index()
  documentHash: string; // SHA-256 Checksum

  @Column({ length: 64, nullable: true })
  @Index()
  uploadedByOfficerId: string;

  @ManyToOne(() => Officer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedByOfficerId' })
  uploadedByOfficer: Officer;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.VERIFIED,
  })
  verificationStatus: VerificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    scannerModel?: string;
    verifiedSignature?: string;
    pageCount?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
