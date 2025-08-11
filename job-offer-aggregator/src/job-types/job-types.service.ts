import { Injectable } from '@nestjs/common';
import { JobType } from './job-type.entity';
import { JobTypeRepository } from './job-type.repository';

@Injectable()
export class JobTypesService {
  constructor(private readonly jobTypeRepository: JobTypeRepository) {}

  async findOrCreateByName(name: string): Promise<JobType> {
    let jobType = await this.jobTypeRepository.findByName(name);
    if (!jobType) {
      jobType = this.jobTypeRepository.create({ name });
      await this.jobTypeRepository.save(jobType);
    }
    return jobType;
  }

  async findOrCreateManyByNames(names: string[]): Promise<JobType[]> {
    const existing = await this.jobTypeRepository.findByNames(names);
    const existingNames = new Set(existing.map(j => j.name));

    const toInsert = names
      .filter(name => !existingNames.has(name))
      .map(name => this.jobTypeRepository.create({ name }));

    await this.jobTypeRepository.save(toInsert);

    return [...existing, ...toInsert];
  }
}