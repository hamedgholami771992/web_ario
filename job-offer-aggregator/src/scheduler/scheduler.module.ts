import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@/common/logger/logger.module';
import { JobFetchCron } from './cron/job-fetch.cron';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentVarTypes } from '@/config/env.types';


@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        ScheduleModule.forRoot(),
        ClientsModule.registerAsync([
            {
                name: "JOB_FETCHER_CLIENT",
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (
                    configService: ConfigService<EnvironmentVarTypes, true>
                ) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('rabbitmq.url', { infer: true })],
                        queue: configService.get<string>('rabbitmq.jobFetcherQueue', { infer: true }),  //emits into this queu
                        queueOptions: { durable: true },
                    }

                }),
            }
        ])
    ],
    providers: [
        JobFetchCron, 
    ],
})
export class SchedulerModule { }
