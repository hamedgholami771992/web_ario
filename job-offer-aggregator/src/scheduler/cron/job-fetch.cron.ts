import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/common/logger/logger.service';
import { EnvironmentVarTypes } from '@/config/env.types';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS } from '@/common/constants/events.constants';

@Injectable()
export class JobFetchCron implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,

    @Inject('JOB_FETCHER_CLIENT')
    private readonly clientProxy: ClientProxy,
    private readonly configService: ConfigService<EnvironmentVarTypes, true>,
    private readonly schedulerRegistry: SchedulerRegistry,

  ) {}

  onModuleInit() {
    const cronPattern = this.configService.get('scheduler.cronSchedule', {infer: true}) || '0 * * * *'; // default every hour

    const job = new CronJob(cronPattern, async () => {
      await this.eventDrivenHandle();
    });

    this.schedulerRegistry.addCronJob('job-fetch', job);
    job.start();

    this.logger.log(`Job-fetch cron scheduled with pattern: ${cronPattern}`);
  }

//   private async handle() {
//     this.logger.log('Starting scheduled job fetch...');
//     try {
//       await this.jobsService.ingestAllJobs();
//       this.logger.log('Scheduled job fetch completed successfully.');
//     } catch (error) {
//         this.logger.error(`Error during job fetch`, error);
//     }
//   }

  async eventDrivenHandle(){
    this.logger.log(`📅 Sending: ${EVENTS.JOB_FETCH_REQUESTED} event...`);
    this.clientProxy.emit(
        EVENTS.JOB_FETCH_REQUESTED, 
        { requestedAt: new Date().toISOString() }
    );
  }
}