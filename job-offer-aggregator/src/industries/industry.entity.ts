import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('industries')
@Unique(['name'])
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
