import { JobFetchCron } from '@/scheduler/cron/job-fetch.cron';
import { LoggerService } from '@/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS } from '@/common/constants/events.constants';
import { CronJob } from 'cron';
import { EnvironmentVarTypes } from '@/config/env.types';

jest.mock('cron', () => {
  return {
    CronJob: jest.fn().mockImplementation((pattern, onTick) => ({
      pattern,
      onTick,
      start: jest.fn(),
    })),
  };
});

describe('JobFetchCron', () => {
  let cronService: JobFetchCron;
  let logger: jest.Mocked<LoggerService>;
  let clientProxy: jest.Mocked<ClientProxy>;
  let config: jest.Mocked<ConfigService<EnvironmentVarTypes, true>>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  beforeEach(() => {
    logger = { log: jest.fn(), error: jest.fn() } as any;
    clientProxy = { emit: jest.fn() } as any;
    config = { get: jest.fn() } as any;
    schedulerRegistry = { addCronJob: jest.fn() } as any;

    cronService = new JobFetchCron(
      logger,
      clientProxy,
      config,
      schedulerRegistry
    );

    jest.clearAllMocks();
  });

  it('should schedule cron job with config pattern', () => {
    config.get.mockReturnValue('*/15 * * * *'); // every 15 minutes

    cronService.onModuleInit();

    expect(config.get).toHaveBeenCalledWith('scheduler.cronSchedule', { infer: true });

    // cast CronJob properly for TS
    const CronJobMock = CronJob as unknown as jest.Mock;

    expect(CronJobMock).toHaveBeenCalledWith('*/15 * * * *', expect.any(Function));

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
      'job-fetch',
      expect.objectContaining({ pattern: '*/15 * * * *' })
    );

    const jobInstance = CronJobMock.mock.results[0].value;
    expect(jobInstance.start).toHaveBeenCalled();

    expect(logger.log).toHaveBeenCalledWith(
      'Job-fetch cron scheduled with pattern: */15 * * * *'
    );
  });

  it('should use default cron pattern if config is missing', () => {
    config.get.mockReturnValue(undefined);

    cronService.onModuleInit();

    const CronJobMock = CronJob as unknown as jest.Mock;
    expect(CronJobMock).toHaveBeenCalledWith('0 * * * *', expect.any(Function));

    expect(logger.log).toHaveBeenCalledWith(
      'Job-fetch cron scheduled with pattern: 0 * * * *'
    );
  });

  it('should emit job fetch event in eventDrivenHandle', async () => {
    const nowIso = '2025-08-11T12:00:00.000Z';
    // Mock Date to always return fixed date instance
    const realDate = Date;
    global.Date = jest.fn(() => new realDate(nowIso)) as unknown as typeof Date;

    await (cronService as any).eventDrivenHandle();

    expect(logger.log).toHaveBeenCalledWith(`📅 Sending: ${EVENTS.JOB_FETCH_REQUESTED} event...`);
    expect(clientProxy.emit).toHaveBeenCalledWith(
      EVENTS.JOB_FETCH_REQUESTED,
      { requestedAt: nowIso }
    );

    // Restore original Date after test
    global.Date = realDate;
  });
});
