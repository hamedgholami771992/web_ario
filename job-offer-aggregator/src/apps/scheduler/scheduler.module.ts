import { Module } from '@nestjs/common';
import { SchedulerModule } from '@/scheduler/scheduler.module';
import { ConfigModule } from '@/config/config.module';
import { LoggerModule } from '@/common/logger/logger.module';
import { HttpClientModule } from '@/common/http/http-client.module';



@Module({
  imports: [
    ConfigModule, 
    LoggerModule,
    HttpClientModule,
    SchedulerModule, 
  ],
})
export class SchedulerWrapperModule {}
