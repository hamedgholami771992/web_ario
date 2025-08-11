import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('job_types')
@Unique(['name'])
export class JobType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
