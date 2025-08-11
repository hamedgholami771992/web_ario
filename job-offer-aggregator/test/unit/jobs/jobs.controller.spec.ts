// jobs.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from '@/jobs/jobs.controller';
import { HealthController } from '@/jobs/health.controller'; 
import { JobsService } from '@/jobs/jobs.service';
import { BadRequestException } from '@nestjs/common';
import { JobOffersQueryDto } from "@/jobs/dto/job-offers-query.dto"
import { Job } from '@/jobs/entities/job.entity';



describe('JobsController', () => {
    let jobController: JobsController;
    let healthController: HealthController;
    let jobsService: jest.Mocked<JobsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JobsController],
            providers: [
                {
                    provide: JobsService,
                    useValue: {
                        findJobs: jest.fn(),
                    },
                },
            ],
        }).compile();

        jobController = module.get<JobsController>(JobsController);
        healthController = module.get<HealthController>(HealthController);
        jobsService = module.get(JobsService);
    });


    describe('healthCheck', () => {
        it('should return { status: "ok" }', () => {
            expect(healthController.healthCheck()).toEqual({ status: 'ok' });
        });
    });

    describe('findAll', () => {
        it('should return jobs from service', async () => {
            const query: JobOffersQueryDto = { title: 'Developer' } as JobOffersQueryDto;
            const mockResult = {
                data: [{ id: 1, title: 'Developer' } as Job],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 20,
                    pages: 1,
                },
            };

            jobsService.findJobs.mockResolvedValue(mockResult);

            const result = await jobController.findAll(query);

            expect(jobsService.findJobs).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockResult);
        });

        it('should throw BadRequestException when service throws', async () => {
            const query: JobOffersQueryDto = { title: 'Developer' } as JobOffersQueryDto;
            jobsService.findJobs.mockRejectedValue(new Error('Something went wrong'));

            await expect(jobController.findAll(query)).rejects.toThrow(BadRequestException);
        });
    });
});
