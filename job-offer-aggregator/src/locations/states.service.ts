import { Injectable } from '@nestjs/common';
import { State } from './entities/state.entity';
import { StateRepository } from './repositories/state.repository';

@Injectable()
export class StatesService {
  constructor(private readonly stateRepository: StateRepository) {}

  async findOrCreateByName(name: string): Promise<State> {
    let state = await this.stateRepository.findByName(name);
    if (!state) {
      state = this.stateRepository.create({ name });
      await this.stateRepository.save(state);
    }
    return state;
  }

  async findOrCreateManyByNames(names: string[]): Promise<State[]> {
    const existing = await this.stateRepository.findByNames(names);
    const existingNames = new Set(existing.map(s => s.name));

    const toInsert = names
      .filter(name => !existingNames.has(name))
      .map(name => this.stateRepository.create({ name }));

    await this.stateRepository.save(toInsert);

    return [...existing, ...toInsert];
  }
}