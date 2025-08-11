import { Injectable } from '@nestjs/common';
import { Currency } from './currency.entity';
import { CurrencyRepository } from './currency.repository';

@Injectable()
export class CurrenciesService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async findOrCreateByName(name: string): Promise<Currency> {
    let currency = await this.currencyRepository.findByName(name);
    if (!currency) {
      currency = this.currencyRepository.create({ name });
      await this.currencyRepository.save(currency);
    }
    return currency;
  }


  async findOrCreateBySymbol(symbol: string): Promise<Currency> {
    let currency = await this.currencyRepository.findBySymbol(symbol);
    if (!currency) {
      currency = this.currencyRepository.create({ symbol });
      await this.currencyRepository.save(currency);
    }
    return currency;
  }

  
  async updateCurrency(id: number, data: { name?: string; symbol?: string }): Promise<Currency> {
    const currency = await this.currencyRepository.findById(id)
    if (!currency) throw new Error(`Currency with id ${id} not found`);

    if (data.name !== undefined) currency.name = data.name;
    if (data.symbol !== undefined) currency.symbol = data.symbol;

    return this.currencyRepository.save(currency);
  }

  
}