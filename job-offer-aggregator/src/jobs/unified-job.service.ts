import { Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { JobRepository } from './repositories/job.repository';

@Injectable()
export class UnifiedJobsService {
  constructor(private readonly jobRepository: JobRepository) {}





  async createManyIfNotExist(jobs: Omit<Job, 'id'>[]): Promise<Job[]> {
    if (!jobs.length) return [];
  
    // Use bulk insert with ON CONFLICT DO NOTHING to avoid errors
    await this.jobRepository
      .createQueryBuilder()
      .insert()
      .into(Job)
      .values(jobs)
      .orIgnore() // Translates to ON CONFLICT DO NOTHING
      .execute();
  
    // Fetch the jobs (existing + newly inserted) in one query
    // so the caller gets the full Job entities back
    const providerIdToExternalIds = new Map<number, string[]>();
    for (const job of jobs) {
      const pid = (job.provider as any).id;
      if (!providerIdToExternalIds.has(pid)) {
        providerIdToExternalIds.set(pid, []);
      }
      providerIdToExternalIds.get(pid)!.push(job.externalId);
    }
  
    const whereClause = Array.from(providerIdToExternalIds.entries())
      .map(
        ([providerId, extIds], idx) =>
          `(provider.id = :pid${idx} AND job.externalId IN (:...exts${idx}))`
      )
      .join(' OR ');
  
    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.provider', 'provider')
      .where(
        whereClause,
        Object.assign(
          {},
          ...Array.from(providerIdToExternalIds.entries()).map(
            ([providerId, extIds], idx) => ({
              [`pid${idx}`]: providerId,
              [`exts${idx}`]: extIds,
            })
          )
        )
      )
      .getMany();
  }
  
}