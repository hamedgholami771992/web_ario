import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices';
import { JobsService } from '@/jobs/jobs.service';
import { LoggerService } from '@/common/logger/logger.service';
import { UnifiedJobDto } from './dto/unified-job.dto';
import { EVENTS } from '@/common/constants/events.constants';
import { Currency } from '@/currencies/currency.entity';
import { CurrencyCacheService } from '@/currencies/currency-cache.service';

@Controller()
export class JobEventsHandler {
    private receivedJobsCounter: number = 0
    constructor(
        private readonly logger: LoggerService,
        private readonly jobsService: JobsService,
        private readonly currencyCacheService: CurrencyCacheService,
    ) {}

    @EventPattern(EVENTS.JOB_FETCH_COMPLETED)
    async handleJobFetchCompleted(
        @Payload() jobs: UnifiedJobDto[],
        @Ctx() context: RmqContext,
    ) {
        this.logger.log(`📥 Received ${jobs.length} jobs from job.fetch.completed`);
        try {
            await this.jobsService.ingestAllJobs(jobs);
            this.receivedJobsCounter = this.receivedJobsCounter + jobs.length
            this.logger.log(`✅ Jobs saved successfully. processedJobs: ${this.receivedJobsCounter}`);
        } catch (err) {
            this.logger.error('❌ Failed to save jobs');
            throw err
        }
    }




    @MessagePattern({ cmd: EVENTS.GET_CACHED_CURRENCIES })
    async getCachedCurrencies(): Promise<Currency[]> {
      return this.currencyCacheService.getAll();
    }
}
