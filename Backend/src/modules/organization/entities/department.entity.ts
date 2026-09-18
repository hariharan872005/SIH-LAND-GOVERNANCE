import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DepartmentStatus } from '../../../common/constants/status.enum';
import { Designation } from './designation.entity';
import { Officer } from './officer.entity';

@Entity('departments')
export class Department {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. dept_rev_01

  @Column({ length: 128, unique: true })
  name: string; // e.g. Revenue / Land Records

  @Column({ length: 32, unique: true })
  code: string; // e.g. REVENUE

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DepartmentStatus, default: DepartmentStatus.ACTIVE })
  status: DepartmentStatus;

  @OneToMany(() => Designation, (desig) => desig.department)
  designations: Designation[];

  @OneToMany(() => Officer, (off) => off.department)
  officers: Officer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
