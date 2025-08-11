import { Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { JobRepository } from './repositories/job.repository';

@Injectable()
export class UnifiedJobsService {
  constructor(private readonly jobRepository: JobRepository) {}



  // async createManyIfNotExist(jobs: Omit<Job, 'id'>[]): Promise<Job[]> {
  //   if (!jobs.length) return [];

  //   // Step 1 — Extract identifiers
  //   const providerIdToExternalIds = new Map<number, string[]>();
  //   for (const job of jobs) {
  //     const pid = (job.provider as any).id;
  //     if (!providerIdToExternalIds.has(pid)) {
  //       providerIdToExternalIds.set(pid, []);
  //     }
  //     providerIdToExternalIds.get(pid)!.push(job.externalId);
  //   }

  //   // Step 2 — Fetch all existing jobs in one query
  //   const existing = await this.jobRepository
  //     .createQueryBuilder('job')
  //     .leftJoinAndSelect('job.provider', 'provider')
  //     .where(
  //       Array.from(providerIdToExternalIds.entries())
  //         .map(
  //           ([providerId, extIds], idx) =>
  //             `(provider.id = :pid${idx} AND job.externalId IN (:...exts${idx}))`
  //         )
  //         .join(' OR '),
  //       Object.assign(
  //         {},
  //         ...Array.from(providerIdToExternalIds.entries()).map(
  //           ([providerId, extIds], idx) => ({
  //             [`pid${idx}`]: providerId,
  //             [`exts${idx}`]: extIds,
  //           })
  //         )
  //       )
  //     )
  //     .getMany();

  //   // Step 3 — Create a lookup set for existing jobs
  //   const existingSet = new Set(
  //     existing.map(j => `${j.provider.id}::${j.externalId}`)
  //   );

  //   // Step 4 — Filter only missing jobs
  //   const toInsert = jobs.filter(
  //     j => !existingSet.has(`${(j.provider as any).id}::${j.externalId}`)
  //   );

  //   // Step 5 — Insert missing jobs in batch
  //   let created: Job[] = [];
  //   if (toInsert.length) {
  //     created = await this.jobRepository.save(
  //       this.jobRepository.create(toInsert)
  //     );
  //   }

  //   // Step 6 — Return combined result without duplicates
  //   return [...existing, ...created];
  // }


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