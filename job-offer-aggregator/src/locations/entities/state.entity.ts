import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('states')
@Unique(['name'])
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
