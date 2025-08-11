import { Injectable } from '@nestjs/common';
import { StatesService } from '@/locations/states.service';
import { CitiesService } from '@/locations/cities.service';
import { SkillsService } from '@/skills/skills.service';
import { IndustriesService } from '@/industries/industries.service';
import { EmployersService } from '@/employers/employers.service';
import { JobTypesService } from '@/job-types/job-types.service';
import { ProviderCacheService } from '@/providers-entities/provider-cache.service';
import { UnifiedJobsService } from './unified-job.service';
import { LoggerService } from '@/common/logger/logger.service';
import { JobRepository } from './repositories/job.repository';
import { CurrencyCacheService } from '@/currencies/currency-cache.service';

import { State } from '@/locations/entities/state.entity';
import { Industry } from '@/industries/industry.entity';
import { Job } from './entities/job.entity';
import { JobType } from '@/job-types/job-type.entity';
import { Skill } from '@/skills/skill.entity';
import { UnifiedJobDto } from './dto/unified-job.dto';
import { JobOffersQueryDto } from './dto/job-offers-query.dto';
import { City } from '@/locations/entities/city.entity';
import { Employer } from '@/employers/employer.entity';



@Injectable()
export class JobsService { 
    constructor(
        private readonly jobRepository: JobRepository,
        private readonly providerCacheService: ProviderCacheService,
        private readonly currencyCacheService: CurrencyCacheService,
        private readonly statesService: StatesService,
        private readonly citiesService: CitiesService,
        private readonly skillsService: SkillsService,
        private readonly industriesService: IndustriesService,
        private readonly employersService: EmployersService,
        private readonly jobTypesService: JobTypesService,
        private readonly unifiedJobService: UnifiedJobsService,
        private readonly logger: LoggerService,
      
    ) { }


    
    async ingestAllJobs(unifiedJobs: UnifiedJobDto[]): Promise<void> {

        // const unifiedJobs: UnifiedJob[] = await this.providersService.getAllJobs();  //no need to call it directly
        const allStates: string[] = []
        const allCityStates: { [state: string]: string[] } = {}
        const allJobTypes: string[] = []
        const allIndustries: string[] = []
        const allSkills: string[] = []
        const allEmployerNames: string[] = []
        const allEmployerInfos: { [employer: string]: { website?: string, industry?: string } } = {}

        //first we have to extarct uniqueData and if they dont exist inside database
        //then we have to insert them into database before creating jobs
        for (const job of unifiedJobs) {
            const jobState = job.locationState
            const jobCity = job.locationCity
            const jobEmployerName = job.employerName

            if (jobState && !allStates.includes(jobState)){
                allStates.push(jobState)
                allCityStates[jobState] = [] //to initialize the state-cities array
            }
            if (jobCity && !allCityStates[jobState].includes(jobCity)){
                allCityStates[jobState].push(jobCity)
            }

            if (job.jobType && !allJobTypes.includes(job.jobType))
                allJobTypes.push(job.jobType)
            if (job.employerIndustry && !allIndustries.includes(job.employerIndustry))
                allIndustries.push(job.employerIndustry)
            if (job.skills?.length > 0) {
                job.skills.forEach(skill => {
                    if (!allSkills.includes(skill))
                        allSkills.push(skill)
                })
            }
            if (job.employerName && !allEmployerNames.includes(jobEmployerName)) {
                allEmployerNames.push(jobEmployerName)
                allEmployerInfos[jobEmployerName] = {
                    industry: job.employerIndustry,
                    website: job.employerWebsite
                }
            }
        }

        // to create state records if not found in batch with just 2 queries
        const allStateRecords = await this.statesService.findOrCreateManyByNames(allStates)

        const requiredDataForCityCreation: { [state: string]: State & { cities: string[] } } = {}
        for (const stateRecord of allStateRecords) {
            requiredDataForCityCreation[stateRecord.name] = { ...stateRecord, cities: allCityStates[stateRecord.name] }
        }

        // to create citiy records if not found in batch with just 2 queries
        const allCityRecords = await this.citiesService.findOrCreateManyByNamesAndStates(requiredDataForCityCreation)
        const allCityRecordsMap: {[city: string]: City} = {}
        for(const cityRec of allCityRecords){
            allCityRecordsMap[cityRec.name] = cityRec
        }

        // to create skill records if not found in batch with just 2 queries
        const allSkillRecords = await this.skillsService.findOrCreateManyByNames(allSkills)
        const allSkillRecordsMap: {[skill: string]: Skill} = {}
        for(const skillRec of allSkillRecords){
            allSkillRecordsMap[skillRec.name] = skillRec
        }

        // to create industry records if not found in batch with just 2 queries
        const allIndustryRecords = await this.industriesService.findOrCreateManyByNames(allIndustries)
        const allIndustryRecordsMap: {[industry: string]: Industry} = {}
        for(const industryRec of allIndustryRecords){
            allIndustryRecordsMap[industryRec.name] = industryRec
        }

        // to create jobType records if not found in batch with just 2 queries
        const allJobTypeRecords = await this.jobTypesService.findOrCreateManyByNames(allJobTypes)
        const allJobTypeRecordsMap: {[jobType: string]: JobType} = {}
        for(const jobTypeRec of allJobTypeRecords){
            allJobTypeRecordsMap[jobTypeRec.name] = jobTypeRec
        }

        const requiredEmployersData: { name: string; website?: string; industry?: Industry; }[] = []
        // to create employer records
        for(const [employer,info] of Object.entries(allEmployerInfos)){
            requiredEmployersData.push({name: employer, website: info.website, industry: allIndustryRecords.find(ind => ind.name === info.industry)})
        }
        const allEmployerRecords = await this.employersService.findOrCreateMany(requiredEmployersData)
        const allEmployerRecordsMap: {[employer: string]: Employer} = {}
        for(const employerRec of allEmployerRecords){
            allEmployerRecordsMap[employerRec.name] = employerRec
        }
    
        //then we have all the data, and we can store jobs in database
        const requiredJobsData: Omit<Job, "id">[] = []
        for(const job of unifiedJobs){
            requiredJobsData.push({
                provider: this.providerCacheService.getByName(job.provider),
                postedAt: new Date(job.postedAt),
                jobType: allJobTypeRecordsMap[job.jobType],
                isRemote: job.isRemote ? job.isRemote : false,
                skills: job.skills.map(sk => allSkillRecordsMap[sk]),
                employer: allEmployerRecordsMap[job.employerName],
                externalId: job.externalId,
                city: allCityRecords.find(c => c.name === job.locationCity && (!job.locationState || c.state.name === job.locationState)),
                currency: job.currencyName ? this.currencyCacheService.getByName(job.currencyName) : undefined,
                maxSalary: job.salaryMax,
                minSalary: job.salaryMin,
                experience: job.experience,
                title: job.title
            })
        }
        await this.unifiedJobService.createManyIfNotExist(requiredJobsData)
    }


    async findJobs(query: JobOffersQueryDto) {
        const minSalary = query.minSalary ? Number(query.minSalary) : undefined;
        const maxSalary = query.maxSalary ? Number(query.maxSalary) : undefined;
    
        if (minSalary !== undefined && maxSalary !== undefined && minSalary > maxSalary) {
          throw new Error('minSalary must be less than or equal to maxSalary');
        }
    
        const page = query.page ?? 1;  //default to 1
        const limit = Math.min(query.limit ?? 20, 100); // at most capped to 100
    
        try {
          const {items, limit, page, total} = await this.jobRepository.findFilteredJobs(query);
    
          return {
            data: items,
            meta: {
              total,
              page,
              limit,
              pages: Math.ceil(total / limit) || 1,
            },
          };
        } catch (error) {
          this.logger.error('Failed to fetch jobs', error.stack ?? error);
          throw error;
        }
      }

}
