import { JobType } from "./job-type.entity";

import { DataSource, Repository } from 'typeorm';


export class JobTypeRepository extends Repository<JobType> {
    constructor(dataSource: DataSource) {
        super(JobType, dataSource.createEntityManager());
    }

    async findByName(name: string): Promise<JobType | null> {
        return this.findOne({ where: { name } });
    }

    async findByNames(names: string[]): Promise<JobType[]> {
        return this.createQueryBuilder('job_type')
            .where('job_type.name IN (:...names)', { names })
            .getMany();
    }


}