import { Skill } from './skill.entity';

import { DataSource, Repository } from 'typeorm';

export class SkillRepository extends Repository<Skill> {
  constructor(dataSource: DataSource) {
    super(Skill, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Skill | null> {
    return this.findOne({ where: { name } });
  }

  async findByNames(names: string[]): Promise<Skill[]> {
    return this.createQueryBuilder('skill')
      .where('skill.name IN (:...names)', { names })
      .getMany();
  }
}