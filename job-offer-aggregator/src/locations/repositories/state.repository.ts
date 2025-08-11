import { State } from "../entities/state.entity";

import { DataSource, Repository } from 'typeorm';

export class StateRepository extends Repository<State> {
  constructor(dataSource: DataSource) {
    super(State, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<State | null> {
    return this.findOne({ where: { name } });
  }

  async findByNames(names: string[]): Promise<State[]> {
    return this.createQueryBuilder('state')
      .where('state.name IN (:...names)', { names })
      .getMany();
  }
}