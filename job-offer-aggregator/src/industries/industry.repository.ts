import { Industry } from "./industry.entity";

import { DataSource, Repository } from 'typeorm';

export class IndustryRepository extends Repository<Industry> {
  constructor(dataSource: DataSource) {
    super(Industry, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Industry | null> {
    return this.findOne({ where: { name } });
  }

  async findByNames(names: string[]): Promise<Industry[]> {
    return this.createQueryBuilder('industry')
      .where('industry.name IN (:...names)', { names })
      .getMany();
  }
}