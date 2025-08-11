import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { State } from './entities/state.entity';
import { CityRepository } from './repositories/city.repository';
import { DataSource } from 'typeorm';
import { StateRepository } from './repositories/state.repository';
import { StatesService } from './states.service';
import { CitiesService } from './cities.service';


@Module({
    imports: [TypeOrmModule.forFeature([City, State])],
    providers: [
        {
            provide: StateRepository,
            useFactory: (dataSource: DataSource) => {
                return new StateRepository(dataSource);
            },
            inject: [DataSource],
        },
        {
            provide: CityRepository,
            useFactory: (dataSource: DataSource) => {
                return new CityRepository(dataSource);
            },
            inject: [DataSource],
        },
        StatesService,
        CitiesService
    ],
    controllers: [],
    exports: [TypeOrmModule, CitiesService, StatesService],
})
export class LocationsModule { }
