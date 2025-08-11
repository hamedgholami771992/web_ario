import { Injectable, OnModuleInit } from '@nestjs/common';
import { Provider } from './provider.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProviderCacheService implements OnModuleInit {
  private providers: Provider[] = [];
  private providerMap = new Map<string, Provider>();

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  async onModuleInit() {
    await this.loadCurrencies();
  }

  async loadCurrencies() {
    this.providers = await this.providerRepo.find();
    this.providerMap.clear();
    for (const provider of this.providers) {
        this.providerMap.set(provider.name.toLowerCase(), provider);
    }
  }

  getAll(): Provider[] {
    return this.providers;
  }

  getByName(name: string): Provider | undefined {
    return this.providerMap.get(name.toLowerCase());
  }
  getMap(): Map<string, Provider> {
    return this.providerMap
  }
}
