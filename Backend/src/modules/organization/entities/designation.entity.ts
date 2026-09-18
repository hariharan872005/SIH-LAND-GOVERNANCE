import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { DesignationStatus } from '../../../common/constants/status.enum';
import { Department } from './department.entity';
import { Officer } from './officer.entity';

@Entity('designations')
export class Designation {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. desig_tahsildar

  @Column({ length: 128 })
  title: string; // e.g. Tahsildar

  @Column({ length: 32 })
  code: string; // e.g. TAHSILDAR

  @Column({ length: 64 })
  @Index()
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.designations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'enum', enum: DesignationStatus, default: DesignationStatus.ACTIVE })
  status: DesignationStatus;

  @OneToMany(() => Officer, (off) => off.designation)
  officers: Officer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
