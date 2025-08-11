import { Currency } from "@/currencies/currency.entity";
import { Employer } from "@/employers/employer.entity";
import { JobType } from "@/job-types/job-type.entity";
import { City } from "@/locations/entities/city.entity";
import { Provider } from "@/providers-entities/provider.entity";
import { Skill } from "@/skills/skill.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('jobs')
@Unique(['externalId', 'provider'])  //ensures the same job from the same provider won’t be inserted twice.
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  externalId: string; // ID from provider API

  @ManyToOne(() => Provider)
  provider: Provider;

  @ManyToOne(() => City, { nullable: true })
  city?: City;

  @ManyToOne(() => JobType, { nullable: true })
  jobType?: JobType;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ type: 'decimal', nullable: true })
  minSalary?: number;

  @Column({ type: 'decimal', nullable: true })
  maxSalary?: number;

  @ManyToOne(() => Currency, { nullable: true })
  currency?: Currency;

  @ManyToOne(() => Employer, { nullable: true })
  employer?: Employer;
  

  @ManyToMany(() => Skill, { cascade: true })
  @JoinTable({
    name: 'job_skills',
    joinColumn: { name: 'jobId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skills: Skill[];

  @Column({ nullable: true })
  experience?: number;

  
  @Column({ type: 'timestamp' })
  postedAt: Date;
}
