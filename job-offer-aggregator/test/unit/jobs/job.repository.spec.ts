// job.repository.spec.ts
import { JobRepository } from '@/jobs/repositories/job.repository';
import { JobOffersQueryDto } from '@/jobs/dto/job-offers-query.dto';
import { DataSource } from 'typeorm';
import { Job } from "@/jobs/entities/job.entity"

describe('JobRepository', () => {
    let jobRepository: JobRepository;
    let mockQueryBuilder: any;

    beforeEach(() => {
        mockQueryBuilder = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
        };

        afterAll(() => {
            jest.clearAllMocks();
            jest.resetModules();
        })


        const mockDataSource = {
            createEntityManager: jest.fn(),
        } as unknown as DataSource;

        jobRepository = new JobRepository(mockDataSource);

        // @ts-ignore — override createQueryBuilder
        jobRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
    });

    it('should build query with filters and return results', async () => {
        const query: JobOffersQueryDto = {
            title: 'Developer',
            city: 'Berlin',
            state: 'Berlin',
            isRemote: true,
            minSalary: 50000,
            maxSalary: 100000,
            currency: 'EUR',
            jobType: 'Full-time',
            skills: ['JavaScript', 'TypeScript'],
            experience: 3,
            fromDate: new Date('2023-01-01') as any,
            toDate: new Date('2023-12-31') as any,
            employerName: 'Acme Corp',
            employerIndustry: 'Tech',
            page: 2,
            limit: 10,
        };

        const result = await jobRepository.findFilteredJobs(query);

        expect(jobRepository.createQueryBuilder).toHaveBeenCalledWith('job');

        // Verify joins
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('job.city', 'city');
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('city.state', 'state');
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('job.jobType', 'jobType');

        // Verify filters
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
            'LOWER(job.title) LIKE :title',
            expect.any(Object)
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
            'LOWER(city.name) LIKE :city',
            expect.any(Object)
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
            'job.isRemote = :isRemote',
            { isRemote: true }
        );

        // Verify pagination
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith((query.page - 1) * query.limit);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(query.limit);

        // Verify order
        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('job.postedAt', 'DESC');

        // Verify result
        expect(result).toEqual({
            total: 1,
            page: 2,
            limit: 10,
            items: [{ id: 1 }],
        });
    });

    it('should use default pagination if not provided', async () => {
        await jobRepository.findFilteredJobs({} as JobOffersQueryDto);

        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
});
