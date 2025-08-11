import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ProvidersService } from './providers.service';
import { EVENTS } from '@/common/constants/events.constants';
import { LoggerService } from '@/common/logger/logger.service';


@Controller()
export class ProvidersEventHandler {
    constructor(
        private readonly logger: LoggerService,
        private readonly providersService: ProvidersService
    ) { 
        this.logger.log('ProvidersEventHandler initialized')
    }

    @EventPattern(EVENTS.JOB_FETCH_REQUESTED)
    async handleJobFetchRequested(
        @Payload() requestedAt: string ,
        @Ctx() context: RmqContext,
    ){
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        this.logger.log(`📅 Received: ${EVENTS.JOB_FETCH_REQUESTED} event...`);
        try {
            await this.providersService.getAllJobs();
            this.logger.log('✅ Jobs fetched and transformed successfully.');
        }
        catch(err){
            this.logger.error('❌ Failed to fetch or transform jobs');
            throw err
        }
    }
}