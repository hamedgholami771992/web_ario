import { Provider2Transformer } from '@/providers/provider2/provider2.transformer';
import { LoggerService } from '@/common/logger/logger.service';
import { ProviderEnum } from '@/common/enums/provider.enum';
import { Provider2Job } from '@/providers/provider2/interfaces/provider2-api-response.interface';

describe('Provider2Transformer', () => {
  let transformer: Provider2Transformer;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;
    transformer = new Provider2Transformer(logger);
  });

  

  const sampleJob: Provider2Job = {
    position: 'Backend Engineer',
    location: {
      city: 'Tehran',
      state: 'Tehran',
      remote: true,
    },
    compensation: {
      min: 50000,
      max: 90000,
      currency: 'USD',
    },
    employer: {
      companyName: 'Proshot',
      website: 'https://proshot.com',
    },
    requirements: {
      experience: 3,
      technologies: ['Node.js', 'PostgreSQL', 'Docker'],
    },
    datePosted: '2025-08-01',
  };

  it('should transform job without jobId correctly', async () => {
    const result = await transformer.transform(sampleJob);

    expect(result).toEqual({
      provider: ProviderEnum.PROVIDER2,
      externalId: undefined,
      title: 'Backend Engineer',
      employerName: 'Proshot',
      employerWebsite: 'https://proshot.com',
      locationCity: 'Tehran',
      locationState: 'Tehran',
      isRemote: true,
      salaryMin: 50000,
      salaryMax: 90000,
      currencyName: 'USD',
      currencySymbol: undefined,
      skills: ['Node.js', 'PostgreSQL', 'Docker'],
      postedAt: new Date('2025-08-01').toISOString(),
      experience: 3,
      jobType: undefined,
    });
  });

  it('should transform job with jobId correctly', async () => {
    const result = await transformer.transform(sampleJob, 'ext-12345');

    expect(result.externalId).toBe('ext-12345');
    expect(result.provider).toBe(ProviderEnum.PROVIDER2);
    expect(result.title).toBe(sampleJob.position);
    expect(result.employerWebsite).toBe(sampleJob.employer.website);
  });
});
