import { Industry } from "@/industries/industry.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('employers')
@Unique(['name'])
export class Employer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Industry, { nullable: true })
  industry?: Industry;

  @Column({ nullable: true })
  website?: string;
}
