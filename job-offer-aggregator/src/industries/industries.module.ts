import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Industry } from './industry.entity';
import { IndustriesService } from './industries.service';
import { IndustryRepository } from './industry.repository';
import { DataSource } from 'typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  providers: [
    IndustriesService,
    {
        provide: IndustryRepository,
        useFactory: (dataSource: DataSource) => {
            return new IndustryRepository(dataSource)
        },
        inject: [DataSource]
    }
  ],
  exports: [TypeOrmModule, IndustriesService], // allows other modules to use Job repository
})
export class IndustriesModule {}