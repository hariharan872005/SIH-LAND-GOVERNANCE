import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { LandStatus, LandType } from '../../../common/constants/status.enum';
import { State } from '../../administrative-scope/entities/state.entity';
import { District } from '../../administrative-scope/entities/district.entity';
import { Taluk } from '../../administrative-scope/entities/taluk.entity';
import { Village } from '../../administrative-scope/entities/village.entity';
import { LandOwner } from './land-owner.entity';
import { LandVerification } from '../../verification/entities/land-verification.entity';
import { LandTransferTransaction } from '../../land-transfer/entities/land-transfer-transaction.entity';
import { DocumentRecord } from '../../documents/entities/document-record.entity';

@Entity('land_parcels')
export class LandParcel {
  @PrimaryColumn({ length: 64 })
  id: string; // Internal UUID / PK

  @Column({ length: 64, unique: true })
  landId: string; // e.g. TN-CHE-101 (National Land ID)

  @Column({ length: 64 })
  @Index()
  surveyNumber: string; // e.g. 142/3B

  @Column({ length: 64, nullable: true })
  subdivisionNumber: string;

  // Administrative Scope Foreign Keys
  @Column({ length: 64 })
  @Index()
  stateId: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId' })
  state: State;

  @Column({ length: 64 })
  @Index()
  districtId: string;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'districtId' })
  district: District;

  @Column({ length: 64 })
  @Index()
  talukId: string;

  @ManyToOne(() => Taluk)
  @JoinColumn({ name: 'talukId' })
  taluk: Taluk;

  @Column({ length: 64 })
  @Index()
  villageId: string;

  @ManyToOne(() => Village)
  @JoinColumn({ name: 'villageId' })
  village: Village;

  @Column({ type: 'enum', enum: LandType, default: LandType.COMMERCIAL })
  landType: LandType;

  @Column({ length: 128, default: 'General Revenue Land' })
  classification: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  registeredArea: number; // in Acres

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  measuredArea: number; // in Acres (DGPS Measured)

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  marketValueINR: number;

  @Column({
    type: 'enum',
    enum: LandStatus,
    default: LandStatus.REQUIRES_SURVEY,
  })
  @Index()
  status: LandStatus;

  // PostGIS Spatial Polygon Geometry (EPSG:4326)
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geometry: any;

  @Column({ type: 'jsonb', nullable: true })
  gisCoordinatesJson: any; // Cached GeoJSON representation

  @Column({ length: 128, default: 'national_cadastre:parcel_poly' })
  geoServerLayerName: string;

  @Column({ default: false })
  isDisputed: boolean;

  @Column({ type: 'text', nullable: true })
  disputeDetails: string;

  @Column({ length: 64, nullable: true })
  createdByOfficerId: string;

  @Column({ length: 64, nullable: true })
  @Index()
  currentOwnerId: string;

  @OneToMany(() => LandOwner, (owner) => owner.land, { cascade: true })
  owners: LandOwner[];

  @OneToMany(() => LandVerification, (ver) => ver.land)
  verifications: LandVerification[];

  @OneToMany(() => LandTransferTransaction, (tx) => tx.land)
  transactions: LandTransferTransaction[];

  @OneToMany(() => DocumentRecord, (doc) => doc.land)
  documents: DocumentRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
