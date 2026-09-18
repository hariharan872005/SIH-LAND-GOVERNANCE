import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { State } from './state.entity';
import { Taluk } from './taluk.entity';

@Entity('districts')
export class District {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. dist_che

  @Column({ length: 128 })
  name: string; // e.g. Chennai

  @Column({ length: 64 })
  @Index()
  stateId: string;

  @ManyToOne(() => State, (state) => state.districts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stateId' })
  state: State;

  @OneToMany(() => Taluk, (taluk) => taluk.district)
  taluks: Taluk[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
