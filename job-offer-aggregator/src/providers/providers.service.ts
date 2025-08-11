import { Inject, Injectable } from '@nestjs/common';
import { Provider1Service } from './provider1/provider1.service';
import { Provider2Service } from './provider2/provider2.service';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@/common/logger/logger.service';
import { EVENTS } from '@/common/constants/events.constants';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly logger: LoggerService,
    private readonly provider1Service: Provider1Service,
    private readonly provider2Service: Provider2Service,
    @Inject("JOB_API_CLIENT")
    private readonly clientProxy: ClientProxy
  ) {}

  async getAllJobs(){
    const [provider1Jobs, provider2Jobs] = await Promise.all([
      this.provider1Service.fetchJobs(),
      this.provider2Service.fetchJobs(),
    ]);

    const allJobs = [...provider1Jobs, ...provider2Jobs];
    this.logger.log(`📅 Sending: ${EVENTS.JOB_FETCH_COMPLETED} event...`);
    this.clientProxy.emit(EVENTS.JOB_FETCH_COMPLETED, allJobs);
  }
}