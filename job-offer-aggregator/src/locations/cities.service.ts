import { Injectable } from '@nestjs/common';
import { City } from './entities/city.entity';
import { CityRepository } from './repositories/city.repository';
import { State } from './entities/state.entity';
import { StateRepository } from './repositories/state.repository';

@Injectable()
export class CitiesService {
  constructor(
    private readonly cityRepository: CityRepository,
    private readonly stateRepository: StateRepository
) {}

  async findOrCreateByName(name: string): Promise<City> {
    let city = await this.cityRepository.findByName(name);
    if (!city) {
      city = this.cityRepository.create({ name });
      await this.cityRepository.save(city);
    }
    return city;
  }

  

   /**
   * Given a map from stateName → { id, name, cities[] },
   * returns all existing or newly created City entities.
   */
   async findOrCreateManyByNamesAndStates(
    cityStatesObj: { [stateName: string]: State & { cities: string[] } }
  ): Promise<City[]> {
    // 1) Flatten into an array of pairs
    const pairs: Array<{ city: string; stateId: number }> = []
    for (const stateData of Object.values(cityStatesObj)) {
      for (const cityName of stateData.cities) {
        pairs.push({ city: cityName, stateId: stateData.id })
      }
    }

    if (pairs.length === 0) {
      return []
    }

    // 2) Fetch all already‐existing cities in one query (using OR‐chain)
    const existing = await this.cityRepository.findManyByNameAndState(pairs)

    // 3) Build a Set of “name|stateId” for quick exclude
    const existingKey = new Set(
      existing.map((c) => `${c.name}|${c.state.id}`),
    )

    // 4) Figure out which pairs we still need to insert
    const toInsert = pairs
      .filter(({ city, stateId }) => !existingKey.has(`${city}|${stateId}`))
      .map(({ city, stateId }) =>
        this.cityRepository.create({
          name: city,
          state: { id: stateId }, // just provide the FK
        }),
      )

    // 5) Bulk‐save new ones
    const inserted = await this.cityRepository.save(toInsert)

    // 6) Return combined
    return [...existing, ...inserted]
  }
}