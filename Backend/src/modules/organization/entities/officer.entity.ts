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
import { OfficerStatus } from '../../../common/constants/status.enum';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { Role } from './role.entity';
import { State } from '../../administrative-scope/entities/state.entity';
import { District } from '../../administrative-scope/entities/district.entity';
import { Taluk } from '../../administrative-scope/entities/taluk.entity';
import { Village } from '../../administrative-scope/entities/village.entity';

@Entity('officers')
export class Officer {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. off_tahsildar_01

  @Column({ length: 64, unique: true })
  employeeId: string; // e.g. GOV-TN-REV-1042

  @Column({ length: 128 })
  fullName: string; // e.g. R. Sundaram

  @Column({ length: 128, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password?: string;

  @Column({ length: 24, nullable: true })
  phone: string;

  @Column({ length: 64 })
  @Index()
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.officers)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ length: 64 })
  @Index()
  designationId: string;

  @ManyToOne(() => Designation, (desig) => desig.officers)
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({ length: 64 })
  @Index()
  roleId: string;

  @ManyToOne(() => Role, (role) => role.officers)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // Geographical Scope Foreign Keys
  @Column({ length: 64, nullable: true })
  @Index()
  stateId: string;

  @ManyToOne(() => State, { nullable: true })
  @JoinColumn({ name: 'stateId' })
  state: State;

  @Column({ length: 64, nullable: true })
  @Index()
  districtId: string;

  @ManyToOne(() => District, { nullable: true })
  @JoinColumn({ name: 'districtId' })
  district: District;

  @Column({ length: 64, nullable: true })
  @Index()
  talukId: string;

  @ManyToOne(() => Taluk, { nullable: true })
  @JoinColumn({ name: 'talukId' })
  taluk: Taluk;

  @Column({ length: 64, nullable: true })
  @Index()
  villageId: string;

  @ManyToOne(() => Village, { nullable: true })
  @JoinColumn({ name: 'villageId' })
  village: Village;

  @Column({ type: 'enum', enum: OfficerStatus, default: OfficerStatus.ACTIVE })
  status: OfficerStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
