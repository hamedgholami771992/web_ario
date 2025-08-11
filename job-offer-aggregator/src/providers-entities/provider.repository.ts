import { Provider } from './provider.entity';

import { DataSource, Repository } from 'typeorm';

export class ProviderRepository extends Repository<Provider> {
  constructor(dataSource: DataSource) {
    super(Provider, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Provider | null> {
    return this.findOne({ where: { name } });
  }


}