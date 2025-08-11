import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { State } from './state.entity'; 

@Entity('cities')
@Unique(['name', 'state']) //combinational uniqueness-> no to cities can have the same name and state
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => State, {eager: true})
  state: State;
}
