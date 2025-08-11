import { Module } from '@nestjs/common';
import { ProvidersModule } from '@/providers/providers.module';
import { ConfigModule } from '@/config/config.module';
import { LoggerModule } from '@/common/logger/logger.module';
import { HttpClientModule } from '@/common/http/http-client.module';





@Module({
  imports: [
    ConfigModule, 
    LoggerModule,
    HttpClientModule,
    ProvidersModule, 
  ],
})
export class JobFetcherModule {}
//currencies,employers, industries, jobTypes, jobs, locations, providerEntities, skills