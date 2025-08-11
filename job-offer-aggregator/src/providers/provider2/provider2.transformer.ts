import { Injectable } from '@nestjs/common';
import { ProviderTransformer } from '../interfaces/provider.transformer';
import { Provider2Job } from './interfaces/provider2-api-response.interface';
import { ProviderEnum } from '../../common/enums/provider.enum';
import { UnifiedJob } from '../../common/interfaces/unified-job.interface';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class Provider2Transformer implements ProviderTransformer<Provider2Job> {
    constructor(
        private readonly logger: LoggerService,
    ){}
    // overload signatures
    async transform(job: Provider2Job): Promise<UnifiedJob>;
    async transform(job: Provider2Job, jobId: string): Promise<UnifiedJob>;
    async transform(job: Provider2Job, jobId?: string): Promise<UnifiedJob> {
        const {
            position,
            location,
            compensation,
            employer,
            requirements,
            datePosted,
        } = job;

        return {
            provider: ProviderEnum.PROVIDER2,
            externalId: jobId,
            title: position,
            employerName: employer.companyName,
            employerWebsite: employer.website,
            locationCity: location.city,
            locationState: location.state,
            isRemote: location.remote,
            salaryMin: compensation.min,
            salaryMax: compensation.max,
            currencyName: compensation.currency,
            currencySymbol: undefined, // no symbol provided
            skills: requirements.technologies,
            postedAt: new Date(datePosted).toISOString(),
            experience: requirements.experience,
            jobType: undefined, // not available
        };
    }
}
