import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@/common/logger/logger.service';
import { Provider2Transformer } from './provider2.transformer';
import { Provider2ApiResponse, Provider2Job } from './interfaces/provider2-api-response.interface';
import { UnifiedJob } from '../../common/interfaces/unified-job.interface';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';

@Injectable()
export class Provider2Service {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService<EnvironmentVarTypes, true>,
    private readonly httpService: HttpService,
    private readonly transformer: Provider2Transformer,
  ) {}

  async fetchJobs(): Promise<UnifiedJob[]> {
    const provider2Address = this.configService.get('jobFetcher.provider2Address', { infer: true });

    try {
      const response = await firstValueFrom(
        this.httpService.get<Provider2ApiResponse>(provider2Address)
      );

      if (response.data.status !== 'success') {
        throw new Error(`Invalid API response from Provider2`);
      }

      const jobsMap = response.data.data.jobsList;
      const unifiedJobs: UnifiedJob[] = [];

      for (const jobId in jobsMap) {
        const job: Provider2Job = jobsMap[jobId];
        const unified = await this.transformer.transform(job, jobId);
        unifiedJobs.push(unified);
      }

      this.loggerService.log(`Fetched and transformed ${unifiedJobs.length} jobs from Provider2`);
      return unifiedJobs;
    } catch (error) {
      this.loggerService.error('Failed to fetch jobs from Provider2', error);
      throw error;
    }
  }
}
