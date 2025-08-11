// provider1.transformer.spec.ts
import { Provider1Transformer } from '@/providers/provider1/provider1.transformer';
import { Provider1Job } from '@/providers/provider1/interfaces/provider1-api-response.interface';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@/common/logger/logger.service';
import { ProviderEnum } from '@/common/enums/provider.enum';
import { Currency } from '@/currencies/currency.entity';
import { of } from 'rxjs';
import {EVENTS} from "@/common/constants/events.constants"

describe('Provider1Transformer', () => {
  let transformer: Provider1Transformer;
  let mockClientProxy: jest.Mocked<ClientProxy>;
  let mockLogger: jest.Mocked<LoggerService>;

  const mockCurrencies: Currency[] = [
    { id: 1, name: 'USD', symbol: '$', description: null },
    { id: 2, name: 'EUR', symbol: '€', description: null },
  ];

  beforeEach(async () => {
    mockClientProxy = {
      send: jest.fn(),
    } as any;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    transformer = new Provider1Transformer(mockClientProxy, mockLogger);
    transformer['cachedCurrencies'] = mockCurrencies;
  });
  

  describe('onModuleInit', () => {
    it('should fetch and store cached currencies', async () => {
      mockClientProxy.send.mockReturnValue(of(mockCurrencies));

      await transformer.onModuleInit();

      expect(mockClientProxy.send).toHaveBeenCalledWith(
        { cmd: EVENTS.GET_CACHED_CURRENCIES },
        {}
      );
      expect(transformer['cachedCurrencies']).toEqual(mockCurrencies);
    });

    it('should log error if fetching currencies fails', async () => {
      const error = new Error('fetch failed');
      mockClientProxy.send.mockImplementation(() => {
        throw error;
      });

      await transformer.onModuleInit();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'error happened in getting cachedCurrencies',
        error
      );
    });
  });

  describe('transform', () => {
    it('should correctly transform Provider1Job to UnifiedJob', async () => {
      const job: Provider1Job = {
        jobId: '123',
        title: 'Software Engineer Remote',
        details: {
          location: 'San Francisco, CA',
          type: 'Full-Time',
          salaryRange: '$72k - $119k',
        },
        company: {
          name: 'TechCorp',
          industry: 'Software',
        },
        skills: ['JavaScript', 'NestJS'],
        postedDate: '2025-08-02T12:00:00Z',
      };

      const result = await transformer.transform(job);

      expect(result).toEqual({
        provider: ProviderEnum.PROVIDER1,
        externalId: '123',
        title: 'Software Engineer Remote',
        employerName: 'TechCorp',
        employerIndustry: 'Software',
        locationCity: 'San Francisco',
        locationState: 'CA',
        isRemote: true,
        salaryMin: 72000,
        salaryMax: 119000,
        currencyName: 'USD',
        currencySymbol: '$',
        skills: ['JavaScript', 'NestJS'],
        postedAt: '2025-08-02T12:00:00Z',
        jobType: 'Full-Time',
      });
    });

  });

  describe('parseSalary', () => {
    it('should parse salary with symbol', () => {
      const result = (transformer as any).parseSalary('$72k - $119k');
      expect(result.salaryMin).toBe(72000);
      expect(result.salaryMax).toBe(119000);
      expect(result.currencySymbol).toBe('$');
      expect(result.currencyName).toBe('USD');
    });

    it('should parse salary with currency name', () => {
      const result = (transformer as any).parseSalary('USD 85k - 100k');
      expect(result.salaryMin).toBe(85000);
      expect(result.salaryMax).toBe(100000);
      expect(result.currencyName).toBe('USD');
      expect(result.currencySymbol).toBe('$');
    });

    it('should handle single value salary', () => {
      const result = (transformer as any).parseSalary('€32M');
      expect(result.salaryMin).toBe(32000000);
      expect(result.salaryMax).toBe(32000000);
      expect(result.currencySymbol).toBe('€');
    });
  });
});
