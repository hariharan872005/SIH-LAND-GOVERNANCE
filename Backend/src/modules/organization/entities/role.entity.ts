import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { Officer } from './officer.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. role_tahsildar

  @Column({ length: 128, unique: true })
  name: string; // e.g. TAHSILDAR

  @Column({ length: 64, nullable: true })
  departmentId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isSystemRole: boolean;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => Officer, (off) => off.role)
  officers: Officer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
