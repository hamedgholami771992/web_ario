import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employer } from './employer.entity';
import { EmployersService } from './employers.service';
import { EmployerRepository } from './employer.repository';
import { DataSource } from 'typeorm';




@Module({
  imports: [TypeOrmModule.forFeature([Employer])],
  providers: [
    EmployersService,
    {
        provide: EmployerRepository,
        useFactory: (dataSource: DataSource) => {
            return new EmployerRepository(dataSource)
        },
        inject: [DataSource]
    }
  ],
  exports: [TypeOrmModule, EmployersService], // allows other modules to use Job repository
})
export class EmployersModule {}