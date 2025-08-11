import { Injectable } from '@nestjs/common';
import { Industry } from './industry.entity';
import { IndustryRepository } from './industry.repository';

@Injectable()
export class IndustriesService {
  constructor(private readonly industryRepository: IndustryRepository) {}


  async findOrCreateByNameByOneQuery(name: string):  Promise<Industry> {
    const result = await this.industryRepository.query(
      `
      WITH ins AS (
        INSERT INTO industries (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
        RETURNING *
      )
      SELECT * FROM ins
      UNION
      SELECT * FROM industries WHERE name = $1
      `,
      [name],
    );
  
    return result[0];
  }

  
  async findOrCreateByName(name: string): Promise<Industry> {
    let industry = await this.industryRepository.findByName(name);
    if (!industry) {
      industry = this.industryRepository.create({ name });
      await this.industryRepository.save(industry);
    }
    return industry;
  }

  async findOrCreateManyByNames(names: string[]): Promise<Industry[]> {
    const existing = await this.industryRepository.findByNames(names);
    const existingNames = new Set(existing.map(ind => ind.name));

    const toInsert = names
      .filter(name => !existingNames.has(name))
      .map(name => this.industryRepository.create({ name }));

    await this.industryRepository.save(toInsert);

    return [...existing, ...toInsert];
  }
}