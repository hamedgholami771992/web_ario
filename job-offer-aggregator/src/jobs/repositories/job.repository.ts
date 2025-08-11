import { JobOffersQueryDto } from "../dto/job-offers-query.dto";
import { Job } from "../entities/job.entity";

import { DataSource, FindOptions, Repository } from 'typeorm';

export class JobRepository extends Repository<Job> {
    constructor(dataSource: DataSource) {
        super(Job, dataSource.createEntityManager());
    }

    async findFilteredJobs(query: JobOffersQueryDto) {
        const qb = this.createQueryBuilder('job')
            .leftJoinAndSelect('job.city', 'city')
            .leftJoinAndSelect('city.state', 'state')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.currency', 'currency')
            .leftJoinAndSelect('job.skills', 'skills')
            .leftJoinAndSelect('job.provider', 'provider')
            .leftJoinAndSelect('job.employer', 'employer')
            .leftJoinAndSelect('employer.industry', 'industry');


        // title
        if (query.title) {
            qb.andWhere('LOWER(job.title) LIKE :title', { title: `%${query.title.toLowerCase()}%` });
        }

        // city name
        if (query.city) {
            qb.andWhere('LOWER(city.name) LIKE :city', { city: `%${query.city.toLowerCase()}%` });
        }

        // state name
        if (query.state) {
            qb.andWhere('LOWER(state.name) LIKE :state', { state: `%${query.state.toLowerCase()}%` });
        }

        // isRemote
        if (query.isRemote !== undefined) {
            qb.andWhere('job.isRemote = :isRemote', { isRemote: query.isRemote });
        }

        // salary range
        if (query.minSalary) {
            qb.andWhere('job.minSalary >= :minSalary', { minSalary: query.minSalary });
        }
        if (query.maxSalary) {
            qb.andWhere('job.maxSalary <= :maxSalary', { maxSalary: query.maxSalary });
        }

        // currency symbol
        if (query.currency) {
            qb.andWhere('LOWER(currency.symbol) = :currency', { currency: query.currency.toLowerCase() });
        }

        // job type
        if (query.jobType) {
            qb.andWhere('LOWER(jobType.name) LIKE :jobType', { jobType: `%${query.jobType.toLowerCase()}%` });
        }

        // skills array
        if (query.skills?.length > 0) {
            qb.andWhere('LOWER(skills.name) IN (:...skills)', {
                skills: query.skills.map(s => s.toLowerCase()),
            });
        }

        // experience
        if (query.experience) {
            qb.andWhere('job.experience >= :experience', { experience: query.experience });
        }

        // posted date range
        if (query.fromDate) {
            qb.andWhere('job.postedAt >= :fromDate', { fromDate: query.fromDate });
        }
        if (query.toDate) {
            qb.andWhere('job.postedAt <= :toDate', { toDate: query.toDate });
        }

        // employer name
    if (query.employerName) {
        qb.andWhere('LOWER(employer.name) LIKE :employerName', { employerName: `%${query.employerName.toLowerCase()}%` });
      }
  
      // employer industry
      if (query.employerIndustry) {
        qb.andWhere('LOWER(industry.name) LIKE :employerIndustry', { employerIndustry: `%${query.employerIndustry.toLowerCase()}%` });
      }

        // pagination
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        qb.skip((page - 1) * limit).take(limit);

        // latest jobs first
        qb.orderBy('job.postedAt', 'DESC');

        // execute once — get data + total count
        const [items, total] = await qb.getManyAndCount();

        return {
            total,
            page,
            limit,
            items,
        };
    }

}