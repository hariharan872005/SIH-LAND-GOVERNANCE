import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Taluk } from './taluk.entity';

@Entity('villages')
export class Village {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. vil_amb_ot

  @Column({ length: 128 })
  name: string; // e.g. Ambattur OT

  @Column({ length: 64 })
  @Index()
  talukId: string;

  @ManyToOne(() => Taluk, (taluk) => taluk.villages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'talukId' })
  taluk: Taluk;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
