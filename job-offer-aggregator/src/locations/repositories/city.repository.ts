import { City } from "../entities/city.entity";

import { Brackets, DataSource, Repository } from 'typeorm';
import { State } from "../entities/state.entity";

export class CityRepository extends Repository<City> {
    constructor(dataSource: DataSource) {
        super(City, dataSource.createEntityManager());
    }

    async findByName(name: string): Promise<City | null> {
        return this.findOne({ where: { name } });
    }

    async findByNames(names: string[]): Promise<City[]> {
        return this.createQueryBuilder('city')
            .where('city.name IN (:...names)', { names })
            .getMany();
    }

    //finds all cities that has the same name and state 
    async findManyByNameAndState(data: { city: string; stateId: number }[]) {
        if (data.length === 0) {
          return []
        }
    
        const qb = this.createQueryBuilder('city')
          .leftJoinAndSelect('city.state', 'state')
          .where(
            new Brackets((qbWhere) => {
              data.forEach(({ city, stateId }, idx) => {
                qbWhere.orWhere(
                  `(city.name = :cityName${idx} AND state.id = :stateId${idx})`,
                  {
                    [`cityName${idx}`]: city,
                    [`stateId${idx}`]: stateId,
                  },
                )
              })
            }),
          )
    
        return qb.getMany()
      }
}