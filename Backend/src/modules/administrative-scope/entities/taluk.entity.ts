import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { District } from './district.entity';
import { Village } from './village.entity';

@Entity('taluks')
export class Taluk {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. taluk_amb

  @Column({ length: 128 })
  name: string; // e.g. Ambattur

  @Column({ length: 64 })
  @Index()
  districtId: string;

  @ManyToOne(() => District, (district) => district.taluks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'districtId' })
  district: District;

  @OneToMany(() => Village, (village) => village.taluk)
  villages: Village[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
