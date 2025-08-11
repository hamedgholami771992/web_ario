import { Injectable } from '@nestjs/common';
import { Employer } from './employer.entity';
import { EmployerRepository } from './employer.repository';
import { Industry } from '@/industries/industry.entity';
import { In } from 'typeorm';

@Injectable()
export class EmployersService {
  constructor(private readonly employerRepository: EmployerRepository) {}

  async findOrCreateOne({name, website, industry}: {
      name: string,
      website?: string,
      industry?: Industry
    }): Promise<Employer> {
    // 1️⃣ First try website match
    if (website) {
      const byWebsite = await this.employerRepository.findOne({
        where: { website },
        relations: ['industry'],
      });
      if (byWebsite) {
        // Fill missing industry
        if (!byWebsite.industry && industry) {
          byWebsite.industry = industry;
          return this.employerRepository.save(byWebsite);
        }
        return byWebsite;
      }
    }
  
    // 2️⃣ Try name match
    const byName = await this.employerRepository.findOne({
      where: { name },
      relations: ['industry'],
    });
  
    if (byName) {
      // If different website or different industry → create new
      if ((website && byName.website && byName.website !== website) ||
          (industry && byName.industry && byName.industry.id !== industry.id)) {
        return this.employerRepository.save(
          this.employerRepository.create({ name, website, industry })
        );
      }
  
      // If missing website, set it
      if (!byName.website && website) byName.website = website;
      // If missing industry, set it
      if (!byName.industry && industry) byName.industry = industry;
  
      return this.employerRepository.save(byName);
    }
  
    // 3️⃣ No match at all → create
    return this.employerRepository.save(
      this.employerRepository.create({ name, website, industry })
    );
  }
  



  async findOrCreateMany(
    employers: { name: string; website?: string; industry?: Industry }[],
  ): Promise<Employer[]> {
    if (!employers?.length) {
      return [];
    }

    // 1) Dedupe by name in-RAM
    const uniqueByName = Array.from(
      new Map(employers.map(e => [e.name, e])).values(),
    );

    // 2) SELECT existing rows by name
    const existing = await this.employerRepository.find({
      where: { name: In(uniqueByName.map(e => e.name)) },
      relations: ['industry'],
    });
    const existingNames = new Set(existing.map(e => e.name));

    // 3) Build the new ones
    const toInsert = uniqueByName
      .filter(e => !existingNames.has(e.name))
      .map(e =>
        this.employerRepository.create({
          name: e.name,
          website: e.website,
          industry: e.industry,
        }),
      );

    // 4) Bulk INSERT with ON CONFLICT DO NOTHING via orIgnore()
    let inserted: Employer[] = [];
    if (toInsert.length) {
      const qbResult = await this.employerRepository
        .createQueryBuilder()
        .insert()
        .into(Employer)
        .values(toInsert)
        .orIgnore()            // <= replaces .onConflict(`("name") DO NOTHING`)
        .returning('*')        // <= still valid for Postgres
        .execute();

      // only the truly inserted rows appear here
      inserted = qbResult.generatedMaps as Employer[];
    }

    // 5) Return everything: old + newly inserted
    return [...existing, ...inserted];
  }
  
}