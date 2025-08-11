import { Provider1Service } from '@/providers/provider1/provider1.service';
import { LoggerService } from '@/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Provider1Transformer } from '@/providers/provider1/provider1.transformer';
import { EnvironmentVarTypes } from '@/config/env.types';
import {
  Provider1ApiResponse,
  Provider1Job,
} from '@/providers/provider1/interfaces/provider1-api-response.interface';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

// sample unified job returned by transformer
const unifiedStub = {
  provider: 'PROVIDER1',
  title: 'Frontend Developer',
} as any;

describe('Provider1Service', () => {
  let service: Provider1Service;
  let logger: jest.Mocked<LoggerService>;
  let config: jest.Mocked<ConfigService<EnvironmentVarTypes, true>>;
  let http: jest.Mocked<HttpService>;
  let transformer: jest.Mocked<Provider1Transformer>;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    config = {
      get: jest.fn().mockReturnValue('http://provider1.test/api'),
    } as any;

    http = {
      get: jest.fn(),
    } as any;

    transformer = {
      transform: jest.fn().mockResolvedValue(unifiedStub),
    } as any;

    service = new Provider1Service(logger, config, http, transformer);
  });

  

  it('should fetch and transform jobs successfully', async () => {
    const mockJob: Provider1Job = {
      jobId: 'job-001',
      title: 'Frontend Developer',
      details: {
        location: 'San Francisco, CA',
        type: 'Full-Time',
        salaryRange: '$72k - $119k',
      },
      company: { name: 'Dev Co', industry: 'Software' },
      skills: ['React', 'TypeScript'],
      postedDate: '2025-08-01T12:00:00Z',
    };

    const mockResponse: Provider1ApiResponse = {
      metadata: {
        requestId: 'req-1',
        timestamp: '2025-08-01T12:00:00Z',
      },
      jobs: [mockJob],
    };

    const axiosMock: AxiosResponse<Provider1ApiResponse> = {
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      // InternalAxiosRequestConfig requires headers, but we don't need full shape in tests
      config: { headers: {} } as any,
    };

    http.get.mockReturnValueOnce(of(axiosMock));

    const result = await service.fetchJobs();

    expect(config.get).toHaveBeenCalledWith('jobFetcher.provider1Address', { infer: true });
    expect(http.get).toHaveBeenCalledWith('http://provider1.test/api');
    expect(transformer.transform).toHaveBeenCalledWith(mockJob);
    expect(result).toEqual([unifiedStub]);
    expect(logger.log).toHaveBeenCalledWith('Fetched and saved 1 jobs from Provider1');
  });

  it('should fetch and transform multiple jobs', async () => {
    const jobA: Provider1Job = {
      jobId: 'job-A',
      title: 'Backend Dev',
      details: { location: 'Austin, TX', type: 'Full-Time', salaryRange: 'USD 80k - 120k' },
      company: { name: 'A Co', industry: 'Infra' },
      skills: ['Node.js'],
      postedDate: '2025-07-30T00:00:00Z',
    };
    const jobB: Provider1Job = {
      jobId: 'job-B',
      title: 'Data Engineer',
      details: { location: 'Remote, -', type: 'Remote', salaryRange: '€50k' },
      company: { name: 'B Co', industry: 'Data' },
      skills: ['Python'],
      postedDate: '2025-07-29T00:00:00Z',
    };

    const mockResponse: Provider1ApiResponse = {
      metadata: { requestId: 'req-2', timestamp: '2025-07-31T00:00:00Z' },
      jobs: [jobA, jobB],
    };

    const axiosMock: AxiosResponse<Provider1ApiResponse> = {
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any,
    };

    http.get.mockReturnValueOnce(of(axiosMock));

    const result = await service.fetchJobs();

    expect(transformer.transform).toHaveBeenCalledTimes(2);
    expect(transformer.transform).toHaveBeenCalledWith(jobA);
    expect(transformer.transform).toHaveBeenCalledWith(jobB);
    expect(result).toEqual([unifiedStub, unifiedStub]);
    expect(logger.log).toHaveBeenCalledWith('Fetched and saved 2 jobs from Provider1');
  });

  it('should throw and log error when request fails', async () => {
    const requestError = new Error('Network error');
    http.get.mockReturnValueOnce(throwError(() => requestError));

    await expect(service.fetchJobs()).rejects.toThrow('Network error');
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to fetch jobs from Provider1',
      requestError,
    );
  });
});
