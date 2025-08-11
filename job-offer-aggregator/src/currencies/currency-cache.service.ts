import { Injectable, OnModuleInit } from '@nestjs/common';
import { Currency } from './currency.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurrencyCacheService implements OnModuleInit {
  private currencies: Currency[] = [];
  private currencyMap = new Map<string, Currency>();

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async onModuleInit() {
    await this.loadCurrencies();
  }

  async loadCurrencies() {
    this.currencies = await this.currencyRepo.find();
    this.currencyMap.clear();
    for (const currency of this.currencies) {
      if (currency.name) {
        this.currencyMap.set(currency.name.toLowerCase(), currency);
      }
    }
  }

  getAll(): Currency[] {
    return this.currencies;
  }

  getByName(name: string): Currency | undefined {
    return this.currencyMap.get(name.toLowerCase());
  }

  
}
