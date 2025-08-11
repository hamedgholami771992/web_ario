import { Currency } from "./currency.entity";

import { DataSource, Repository } from 'typeorm';

export class CurrencyRepository extends Repository<Currency> {
  constructor(dataSource: DataSource) {
    super(Currency, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Currency | null> {
    return this.findOne({where: {id}})
  }
  async findByName(name: string): Promise<Currency | null> {
    return this.findOne({ where: { name } });
  }

  async findBySymbol(symbol: string): Promise<Currency | null> {
    return this.findOne({ where: { symbol } });
  }


}