import { Injectable } from '@nestjs/common';
import { Provider } from './provider.entity';
import { ProviderRepository } from './provider.repository';

@Injectable()
export class ProviderEntitiesService {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async findOrCreateByName(name: string): Promise<Provider> {
    let provider = await this.providerRepository.findByName(name);
    if (!provider) {
      provider = this.providerRepository.create({ name });
      await this.providerRepository.save(provider);
    }
    return provider;
  }

}