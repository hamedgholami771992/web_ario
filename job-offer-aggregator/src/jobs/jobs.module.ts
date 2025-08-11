import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { JobRepository } from './repositories/job.repository';
import { DataSource } from 'typeorm';
import { UnifiedJobsService } from './unified-job.service';
import { ProviderEntitiesModule } from '@/providers-entities/providers-entities.module';
import { JobTypesModule } from '@/job-types/job-types.module';
import { CurrenciesModule } from '@/currencies/currencies.module';
import { SkillsModule } from '@/skills/skills.module';
import { EmployersModule } from '@/employers/employers.module';
// import { ProvidersModule } from '@/providers/providers.module';
import { LocationsModule } from '@/locations/locations.module';
import { IndustriesModule } from '@/industries/industries.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@/common/logger/logger.module';
import { JobEventsHandler } from './jobs-events.controller';
import { JobsController } from './jobs.controller';
import { HealthController } from './health.controller';


@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Job]),

    LoggerModule,
    ProviderEntitiesModule,
    JobTypesModule,
    CurrenciesModule,
    SkillsModule,
    EmployersModule,
    // ProvidersModule,
    LocationsModule,
    IndustriesModule
  ],
  controllers: [JobEventsHandler, JobsController, HealthController],
  providers: [
    JobsService,
    UnifiedJobsService,
    {
      provide: JobRepository,
      useFactory: (dataSource: DataSource) => {
        return new JobRepository(dataSource)
      },
      inject: [DataSource]
    }
  ],
  exports: [TypeOrmModule, JobsService], // allows other modules to use Job repository
})
export class JobsModule { }