import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './currency.entity';
import { DataSource } from 'typeorm';
import { CurrenciesService } from './currencies.service';
import { CurrencyRepository } from './currency.repository';
import { CurrencyController } from './currencies.controller';
import { CurrencyCacheService } from './currency-cache.service';


@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [
    CurrenciesService,
    CurrencyCacheService,
    {
        provide: CurrencyRepository,
        useFactory: (dataSource: DataSource) => {
            return new CurrencyRepository(dataSource)
        },
        inject: [DataSource]
    }
  ],
  controllers: [CurrencyController],
  exports: [TypeOrmModule, CurrenciesService, CurrencyCacheService], // allows other modules to use Job repository
})
export class CurrenciesModule {}