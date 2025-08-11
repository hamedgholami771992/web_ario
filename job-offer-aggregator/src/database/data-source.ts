import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Provider } from '@/providers-entities/provider.entity';
import { Currency } from '@/currencies/currency.entity';
import { Employer } from '@/employers/employer.entity';
import { City } from '@/locations/entities/city.entity';
import { State } from '@/locations/entities/state.entity';
import { Industry } from '@/industries/industry.entity';
import { Job } from '@/jobs/entities/job.entity';
import { JobType } from '@/job-types/job-type.entity';
import { Skill } from '@/skills/skill.entity';


const isDev = process.env.NODE_ENV === 'development';


const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Provider, Skill, Currency, Industry, Employer, State, City, JobType, Job],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: isDev,
});


export default dataSource



