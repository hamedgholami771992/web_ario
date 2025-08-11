import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@/common/logger/logger.service';
import { Provider1Transformer } from './provider1.transformer';
import { Provider1ApiResponse, Provider1Job } from './interfaces/provider1-api-response.interface';
import { UnifiedJob } from '../../common/interfaces/unified-job.interface';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';

@Injectable()
export class Provider1Service {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService<EnvironmentVarTypes, true>,
    private readonly httpService: HttpService,
    private readonly transformer: Provider1Transformer,
    
  ) {}

  async fetchJobs(): Promise<UnifiedJob[]> {
    const provider1Address = this.configService.get("jobFetcher.provider1Address", {infer: true})
    try {
      const response = await firstValueFrom(
        this.httpService.get<Provider1ApiResponse>(provider1Address) 
      );

      const jobs: Provider1Job[] = response.data.jobs;
      const unifiedJobs: UnifiedJob[] = []

      for (const job of jobs) {
        const unified = await this.transformer.transform(job);
        unifiedJobs.push(unified)
      }

      this.loggerService.log(`Fetched and saved ${jobs.length} jobs from Provider1`);
      return unifiedJobs
    } catch (error) {
      this.loggerService.error('Failed to fetch jobs from Provider1', error);
      throw error;
    }
  }
}
