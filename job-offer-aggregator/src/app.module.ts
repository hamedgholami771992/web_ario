import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ProvidersModule } from './providers/providers.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ConfigModule } from '@/config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { SkillsModule } from './skills/skills.module';
import { IndustriesModule } from './industries/industries.module';
import { ProviderEntitiesModule } from './providers-entities/providers-entities.module';
import { LocationsModule } from './locations/locations.module';
import { JobTypesModule } from './job-types/job-types.module';
import { EmployersModule } from './employers/employers.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { HttpClientModule } from './common/http/http-client.module';



@Module({
  imports: [
    ConfigModule, 
    LoggerModule,
    HttpClientModule,
    DatabaseModule,
    JobsModule, 
    ProvidersModule, 
    SchedulerModule, 
    SkillsModule,
    IndustriesModule,
    ProviderEntitiesModule,
    LocationsModule,
    JobTypesModule,
    EmployersModule,
    CurrenciesModule,
  ],
})
export class AppModule {}
