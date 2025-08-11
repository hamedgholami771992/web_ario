import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobType } from './job-type.entity';
import { JobTypesService } from './job-types.service';
import { JobTypeRepository } from './job-type.repository';
import { DataSource } from 'typeorm';



@Module({
  imports: [TypeOrmModule.forFeature([JobType])],
  providers: [
    JobTypesService,
    {
        provide: JobTypeRepository,
        useFactory: (dataSource: DataSource) => {
            return new JobTypeRepository(dataSource)
        },
        inject: [DataSource]
    }
  ],
  exports: [TypeOrmModule, JobTypesService], // allows other modules to use Job repository
})
export class JobTypesModule {}