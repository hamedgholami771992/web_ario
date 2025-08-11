import { Injectable } from '@nestjs/common';
import { Skill } from './skill.entity';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillsService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async findOrCreateByName(name: string): Promise<Skill> {
    let skill = await this.skillRepository.findByName(name);
    if (!skill) {
      skill = this.skillRepository.create({ name });
      await this.skillRepository.save(skill);
    }
    return skill;
  }

  async findOrCreateManyByNames(names: string[]): Promise<Skill[]> {
    const existing = await this.skillRepository.findByNames(names);
    const existingNames = new Set(existing.map(s => s.name));

    const toInsert = names
      .filter(name => !existingNames.has(name))
      .map(name => this.skillRepository.create({ name }));

    await this.skillRepository.save(toInsert);

    return [...existing, ...toInsert];
  }
}