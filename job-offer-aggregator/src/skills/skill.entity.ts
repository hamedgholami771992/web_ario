import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('skills')
@Unique(['name'])
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // stored lowercase, enforce in service before save
}
