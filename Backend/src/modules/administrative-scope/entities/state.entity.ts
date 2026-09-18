import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { District } from './district.entity';

@Entity('states')
export class State {
  @PrimaryColumn({ length: 64 })
  id: string; // e.g. state_tn

  @Column({ length: 128, unique: true })
  name: string; // e.g. Tamil Nadu

  @Column({ length: 8, unique: true })
  code: string; // e.g. TN

  @OneToMany(() => District, (district) => district.state)
  districts: District[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
