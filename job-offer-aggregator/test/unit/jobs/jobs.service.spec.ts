import { JobsService } from '@/jobs/jobs.service';
import { JobRepository } from '@/jobs/repositories/job.repository';
import { LoggerService } from '@/common/logger/logger.service';
import {JobOffersQueryDto} from '@/jobs/dto/job-offers-query.dto'
import { Job } from '@/jobs/entities/job.entity';

describe('JobsService - findJobs', () => {
  let jobsService: JobsService;
  let jobRepository: jest.Mocked<JobRepository>;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    jobRepository = {
      findFilteredJobs: jest.fn(),
    } as any;

    logger = {
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    jobsService = new JobsService(
      jobRepository as any,       // other deps omitted since not used in findJobs
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      logger,
    );
  });



  it('should call repository with valid query and return paginated data', async () => {
    const query: JobOffersQueryDto = {
      minSalary: 3000,
      maxSalary: 5000,
      page: 2,
      limit: 10,
    };

    const repoResult = {
      items: [{ id: 1, title: 'Dev' } as Job],
      total: 15,
      page: 2,
      limit: 10,
    };

    jobRepository.findFilteredJobs.mockResolvedValue(repoResult);

    const result = await jobsService.findJobs(query);

    expect(jobRepository.findFilteredJobs).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      data: repoResult.items,
      meta: {
        total: repoResult.total,
        page: repoResult.page,
        limit: repoResult.limit,
        pages: Math.ceil(repoResult.total / repoResult.limit),
      },
    });
  });

  it('should throw error if minSalary > maxSalary', async () => {
    const query: JobOffersQueryDto = {
      minSalary: 5000,
      maxSalary: 3000,
    };

    await expect(jobsService.findJobs(query)).rejects.toThrow(
      'minSalary must be less than or equal to maxSalary'
    );

    expect(jobRepository.findFilteredJobs).not.toHaveBeenCalled();
  });

  it('should log and rethrow error from repository', async () => {
    const query: JobOffersQueryDto = {};

    const error = new Error('DB error');
    jobRepository.findFilteredJobs.mockRejectedValue(error);

    await expect(jobsService.findJobs(query)).rejects.toThrow(error);

    expect(logger.error).toHaveBeenCalledWith('Failed to fetch jobs', error.stack);
  });

  it('should apply default pagination if page and limit missing', async () => {
    const query: JobOffersQueryDto = {};

    const repoResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };

    jobRepository.findFilteredJobs.mockResolvedValue(repoResult);

    const result = await jobsService.findJobs(query);

    expect(jobRepository.findFilteredJobs).toHaveBeenCalledWith(query);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(20);
  });

  it('should cap limit to 100 even if higher value passed', async () => {
    const query: JobOffersQueryDto = {
      limit: 1000,
    };

    const repoResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 100,
    };

    jobRepository.findFilteredJobs.mockResolvedValue(repoResult);

    const result = await jobsService.findJobs(query);

    expect(jobRepository.findFilteredJobs).toHaveBeenCalledWith(query);
    expect(result.meta.limit).toBe(100);
  });
});
