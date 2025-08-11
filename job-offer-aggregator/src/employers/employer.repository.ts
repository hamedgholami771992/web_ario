import { Employer } from "./employer.entity";

import { DataSource, Repository } from 'typeorm';

export class EmployerRepository extends Repository<Employer> {
  constructor(dataSource: DataSource) {
    super(Employer, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Employer | null> {
    return this.findOne({ where: { name } });
  }

  async findByNames(names: string[]): Promise<Employer[]> {
    return this.createQueryBuilder('employer')
      .where('employer.name IN (:...names)', { names })
      .getMany();
  }
}