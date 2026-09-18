import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. perm_view_land

  @Column({ length: 64, unique: true })
  code: string; // e.g. VIEW_LAND

  @Column({ length: 128 })
  name: string; // e.g. View Land Records

  @Column({ length: 64 })
  category: string; // e.g. REVENUE, SURVEY, REGISTRATION, MUNICIPALITY, SYSTEM

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
