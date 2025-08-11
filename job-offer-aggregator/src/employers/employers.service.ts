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
  



  // async findOrCreateMany(
  //   employers: { name: string; website?: string; industry?: Industry }[]
  // ): Promise<Employer[]> {
  //   const withWebsite = employers.filter(e => !!e.website);
  //   const withoutWebsite = employers.filter(e => !e.website);
  
  //   const websiteMap = new Map<string, typeof employers[0]>();
  //   withWebsite.forEach(e => websiteMap.set(e.website!, e));
  
  //   const nameMap = new Map<string, typeof employers[0][]>();
  //   withoutWebsite.forEach(e => {
  //     if (!nameMap.has(e.name)) nameMap.set(e.name, []);
  //     nameMap.get(e.name)!.push(e);
  //   });
  
  //   // 1️⃣ Fetch all existing employers by website
  //   const existingByWebsite = await this.employerRepository.find({
  //     where: { website: In([...websiteMap.keys()]) },
  //     relations: ['industry'],
  //   });
  
  //   const updates: Employer[] = [];
  //   const toCreate: typeof employers[0][] = [];
  
  //   // Process website matches
  //   const matchedWebsites = new Set<string>();
  //   for (const existing of existingByWebsite) {
  //     matchedWebsites.add(existing.website!);
  //     const incoming = websiteMap.get(existing.website!);
  //     if (incoming?.industry && !existing.industry) {
  //       existing.industry = incoming.industry;
  //       updates.push(existing);
  //     }
  //   }
  
  //   // Websites that were not found in DB
  //   const unmatchedWithWebsite = withWebsite.filter(
  //     e => !matchedWebsites.has(e.website!)
  //   );
  
  //   // 2️⃣ Fetch all by name for unmatched-with-website + withoutWebsite
  //   const nameCandidates = [
  //     ...unmatchedWithWebsite.map(e => e.name),
  //     ...withoutWebsite.map(e => e.name),
  //   ];
  
  //   const existingByName = await this.employerRepository.find({
  //     where: { name: In(nameCandidates) },
  //     relations: ['industry'],
  //   });
  
  //   // Group existing by name for fast lookup
  //   const existingNameMap = new Map<string, Employer[]>();
  //   for (const ex of existingByName) {
  //     if (!existingNameMap.has(ex.name)) existingNameMap.set(ex.name, []);
  //     existingNameMap.get(ex.name)!.push(ex);
  //   }
  
  //   // 3️⃣ Compare name matches
  //   for (const incoming of [...unmatchedWithWebsite, ...withoutWebsite]) {
  //     const matches = existingNameMap.get(incoming.name) || [];
  
  //     let matched: Employer | null = null;
  //     for (const match of matches) {
  //       // If website differs → consider different employer
  //       if (incoming.website && match.website && match.website !== incoming.website) {
  //         continue;
  //       }
  //       // If industry differs → consider different employer
  //       if (
  //         incoming.industry &&
  //         match.industry &&
  //         match.industry.id !== incoming.industry.id
  //       ) {
  //         continue;
  //       }
  //       matched = match;
  //       break;
  //     }
  
  //     if (matched) {
  //       // Fill missing fields if available
  //       if (!matched.website && incoming.website) matched.website = incoming.website;
  //       if (!matched.industry && incoming.industry) matched.industry = incoming.industry;
  //       updates.push(matched);
  //     } else {
  //       toCreate.push(incoming);
  //     }
  //   }
  
  //   // 4️⃣ Perform batch updates
  //   if (updates.length) {
  //     await this.employerRepository.save(updates);
  //   }
  
  //   // 5️⃣ Perform batch inserts
  //   let created: Employer[] = [];
  //   if (toCreate.length) {
  //     created = await this.employerRepository.save(
  //       this.employerRepository.create(toCreate)
  //     );
  //   }
  
  //   return [...existingByWebsite, ...existingByName, ...created];
  // }


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