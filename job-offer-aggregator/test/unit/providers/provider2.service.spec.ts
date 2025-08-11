import { Provider2Service } from '@/providers/provider2/provider2.service';
import { LoggerService } from '@/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Provider2Transformer } from '@/providers/provider2/provider2.transformer';
import { EnvironmentVarTypes } from '@/config/env.types';
import { Provider2ApiResponse } from '@/providers/provider2/interfaces/provider2-api-response.interface';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

// A sample unified job to be returned from transformer
const unifiedStub = {
  provider: 'PROVIDER2',
  title: 'Backend Engineer',
} as any;

describe('Provider2Service', () => {
  let service: Provider2Service;
  let logger: jest.Mocked<LoggerService>;
  let config: jest.Mocked<ConfigService<EnvironmentVarTypes, true>>;
  let http: jest.Mocked<HttpService>;
  let transformer: jest.Mocked<Provider2Transformer>;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    config = {
      get: jest.fn().mockReturnValue('http://provider2.test/api'),
    } as any;

    http = {
      get: jest.fn(),
    } as any;

    transformer = {
      transform: jest.fn().mockResolvedValue(unifiedStub),
    } as any;

    service = new Provider2Service(logger, config, http, transformer);
  });

  

  it('should fetch and transform jobs successfully', async () => {
    const mockResponse: Provider2ApiResponse = {
      status: 'success',
      data: {
        jobsList: {
          'job-123': {
            position: 'Backend Engineer',
            location: { city: 'Tehran', state: 'KR', remote: true },
            compensation: { min: 50, max: 80, currency: 'USD' },
            employer: { companyName: 'Proshot', website: 'https://proshot.com' },
            requirements: { technologies: ['Node.js'], experience: 2 },
            datePosted: '2025-08-01',
          },
        },
      },
    };

    const axiosMock: AxiosResponse<Provider2ApiResponse> = {
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    http.get.mockReturnValueOnce(of(axiosMock));

    const result = await service.fetchJobs();

    expect(config.get).toHaveBeenCalledWith('jobFetcher.provider2Address', { infer: true });
    expect(http.get).toHaveBeenCalledWith('http://provider2.test/api');
    expect(transformer.transform).toHaveBeenCalledWith(
      mockResponse.data.jobsList['job-123'],
      'job-123'
    );
    expect(result).toEqual([unifiedStub]);
    expect(logger.log).toHaveBeenCalledWith('Fetched and transformed 1 jobs from Provider2');
  });

  it('should throw and log error when API status is not success', async () => {
    const badResponse: Provider2ApiResponse = {
      status: 'error',
      data: { jobsList: {} },
    };

    const axiosMock: AxiosResponse<Provider2ApiResponse> = {
      data: badResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    http.get.mockReturnValueOnce(of(axiosMock));

    await expect(service.fetchJobs()).rejects.toThrow('Invalid API response from Provider2');

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to fetch jobs from Provider2',
      expect.any(Error)
    );
  });

  it('should throw and log error when request fails', async () => {
    const requestError = new Error('Network error');
    http.get.mockReturnValueOnce(throwError(() => requestError));

    await expect(service.fetchJobs()).rejects.toThrow('Network error');

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to fetch jobs from Provider2',
      requestError
    );
  });
});
