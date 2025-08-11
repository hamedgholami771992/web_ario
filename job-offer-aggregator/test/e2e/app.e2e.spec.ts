// // e2e/full-flow.e2e-spec.ts

// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { JobApiModule } from '@/apps/job-api/job-api.module';
// import { JobFetcherModule } from '@/apps/job-fetcher/job-fetcher.module';
// import { SchedulerWrapperModule } from '@/apps/scheduler/scheduler.module';
// import { DataSource } from 'typeorm';
// import { runSeeders } from '@/database/seed';
// import { Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
// import * as request from 'supertest';
// import { lastValueFrom, of } from 'rxjs';
// import { ConfigModule } from '@nestjs/config';
// import { HttpModule, HttpService } from '@nestjs/axios';
// import { jest } from '@jest/globals';
// import { Provider } from '@/providers-entities/provider.entity';
// import { Currency } from "@/currencies/currency.entity"
// import { AxiosResponse } from 'axios';
// import { EVENTS } from '@/common/constants/events.constants';
// import { RmqContext } from '@nestjs/microservices';
// import * as amqplib from 'amqplib';
// import { Provider1ApiResponse, Provider1Job } from '@/providers/provider1/interfaces/provider1-api-response.interface';
// import { Provider2ApiResponse, Provider2Job } from '@/providers/provider2/interfaces/provider2-api-response.interface';
// import { JobFetchCron } from '@/scheduler/cron/job-fetch.cron';
// import { JobsService } from '@/jobs/jobs.service';
// import { ProvidersService } from '@/providers/providers.service';
// import { Provider1Service } from '@/providers/provider1/provider1.service';
// import { Provider2Service } from '@/providers/provider2/provider2.service';
// import { UnifiedJob } from '@/common/interfaces/unified-job.interface';
// import { ProviderEnum } from '@/common/enums/provider.enum';


// jest.setTimeout(30000);

// export async function seedTestData(db: DataSource): Promise<{ currencies: Currency[], providers: Provider[] }> {
//   const currencyRepo = db.getRepository(Currency);
//   const providerRepo = db.getRepository(Provider);

//   const currency = currencyRepo.create({
//     name: 'USD',
//     symbol: '$',
//   });
//   await currencyRepo.save(currency);

//   const provider1 = providerRepo.create({
//     name: 'PROVIDER1',
//     address: 'https://assignment.devotel.io/api/provider1/jobs',
//   });
//   const provider2 = providerRepo.create({
//     name: 'PROVIDER2',
//     address: 'https://assignment.devotel.io/api/provider2/jobs',
//   });
//   await providerRepo.save(provider1);
//   await providerRepo.save(provider2);

//   return {
//     providers: [provider1, provider2],
//     currencies: [currency]
//   };
// }


// async function connectWithTimeout(url: string, ms: number) {
//   const timeout = new Promise((_, reject) =>
//     setTimeout(() => reject(new Error(`RabbitMQ connection timeout after ${ms}ms`)), ms)
//   );
//   return Promise.race([
//     amqplib.connect(url),
//     timeout
//   ]);
// }

// const job1: Provider1Job = {
//   jobId: 'job-1',
//   title: 'Job from Provider 1',
//   company: { industry: "IT", name: "Proshot" },
//   details: { location: "Karaj, Alborz", salaryRange: "$100K - $200K", type: "Full-time" },
//   postedDate: "2025-08-10T15:23:26.165Z",
//   skills: ["React.js"]
// }
// const job2: Provider2Job = {
//   location: { city: "Varamin", state: "Tehran", remote: false },
//   compensation: { currency: "USD", max: 100, min: 20 },
//   datePosted: "2025-08-04",
//   employer: { companyName: "Telmis", website: "telmis.ir" },
//   position: "Front-end developer",
//   requirements: { technologies: ["Css"], experience: 2 }
// }

// describe('Full Pipeline E2E', () => {
//   let jobApiApp: INestApplication;
//   let jobFetcherApp: INestApplication;
//   let schedulerApp: INestApplication;
//   let dataSource: DataSource;
//   let rabbitConnection: amqplib.Connection;
//   let channel: amqplib.Channel;


//   const mockClientProxy = {
//     emit: jest.fn(),
//     send: jest.fn(),
//   };

//   // Mock HttpService returning different responses
//   const mockHttpService = {
//     get: jest.fn((url: string) => {
//       if (url.includes('provider1')) {
//         // Mock response from provider1 API
//         const response: AxiosResponse = {
//           data: [{
//             jobs: [job1],
//           } as Provider1ApiResponse],
//           status: 200,
//           statusText: 'OK',
//           headers: {},
//           config: {} as any,
//         };
//         return of(response);
//       } else if (url.includes('provider2')) {
//         // Mock response from provider2 API
//         const response: AxiosResponse = {
//           data: [{
//             status: "success",
//             data: {
//               jobsList: {
//                 "job-2": job2
//               }
//             }
//           } as Provider2ApiResponse],
//           status: 200,
//           statusText: 'OK',
//           headers: {},
//           config: {} as any,
//         };
//         return of(response);
//       }
//       // Default mock response
//       return of({ data: [], status: 200, statusText: 'OK', headers: {}, config: {} });
//     }),
//   };




//   beforeAll(async () => {
//     // Connect to RabbitMQ
//     console.log(process.env.RABBITMQ_URL)
//     // rabbitConnection = await amqplib.connect("amqp://payever:payever@localhost:5672");
   
//     // channel = await rabbitConnection.createChannel();

//     // await channel.assertQueue(process.env.JOB_FETCHER_QUEUE, { durable: true });
  
//     // await channel.assertQueue(process.env.JOB_API_QUEUE, { durable: true });
//     // await channel.assertQueue(process.env.SCHEDULER_QUEUE, { durable: true });


//     console.log("🐇 RabbitMQ URL from env:", process.env.RABBITMQ_URL);

//     if (!process.env.RABBITMQ_URL) {
//       throw new Error("❌ RABBITMQ_URL is not defined in environment variables");
//     }
  
//     try {
//       rabbitConnection = await connectWithTimeout(process.env.RABBITMQ_URL, 5000);
//       console.log("✅ Connected to RabbitMQ successfully");
  
//       channel = await rabbitConnection.createChannel();
//       await channel.assertQueue(process.env.JOB_FETCHER_QUEUE, { durable: true });
//       await channel.assertQueue(process.env.JOB_API_QUEUE, { durable: true });
//       await channel.assertQueue(process.env.SCHEDULER_QUEUE, { durable: true });
//       console.log("📦 Queues asserted successfully");
//     } catch (err) {
//       console.error("❌ Failed to connect to RabbitMQ:", err);
//       throw err; // Fail fast
//     }
  


//     // Set NODE_ENV for in-memory DB configuration
//     process.env.NODE_ENV = 'test';

//     // 1. Setup Job API app with in-memory DB and seed data
//     const jobApiModuleFixture: TestingModule = await Test.createTestingModule({
//       imports: [JobApiModule],
//     }).compile();

//     jobApiApp = jobApiModuleFixture.createNestApplication();
//     await jobApiApp.init();

//     dataSource = jobApiApp.get(DataSource);
//     await seedTestData(dataSource);

//     // 2. Setup Job Fetcher app with mocked HttpService
//     const jobFetcherModuleFixture: TestingModule = await Test.createTestingModule({
//       imports: [JobFetcherModule],
//     })
//     .overrideProvider('HttpService')
//     .useValue(mockHttpService)
//     .compile();

//     jobFetcherApp = jobFetcherModuleFixture.createNestApplication();
//     await jobFetcherApp.init();

//     // 3. Setup Scheduler app
//     const schedulerModuleFixture: TestingModule = await Test.createTestingModule({
//       imports: [SchedulerWrapperModule],
//     })
//       .overrideProvider(ClientProxy) // override ClientProxy in the scheduler module
//       .useValue(mockClientProxy)
//       .compile();

//     schedulerApp = schedulerModuleFixture.createNestApplication();
//     await schedulerApp.init();



//     // Prepare in-memory DB + seed
//     dataSource = jobApiApp.get(DataSource);
//     await dataSource.synchronize(true);
//     await seedTestData(dataSource);
//   });

//   afterAll(async () => {
//     await channel.close();
//     await rabbitConnection.close();
//     dataSource?.destroy()
//     await jobApiApp.close();
//     await jobFetcherApp.close();
//     // await schedulerApp.close();
//   });


//   it('should publish job fetched event to RabbitMQ', async () => {
//     const jobFetchCron = schedulerApp.get(JobFetchCron);

//     await jobFetchCron.eventDrivenHandle();

//     expect(mockClientProxy.emit).toHaveBeenCalledWith(
//       EVENTS.JOB_FETCH_REQUESTED,
//       expect.anything()
//     );
//   });

//   it('should call job fetcher cron and handle fetching jobs', async () => {
//     const jobFetchCron = schedulerApp.get('JobFetchCron');

//     // Call the cron handler manually to simulate scheduled job run
//     await jobFetchCron.eventDrivenHandle();

//     // incomplete
//   });


//   const job2: Provider2Job = {
//     location: { city: "Varamin", state: "Tehran", remote: false },
//     compensation: { currency: "USD", max: 100, min: 20 },
//     datePosted: "2025-08-04",
//     employer: { companyName: "Telmis", website: "telmis.ir" },
//     position: "Front-end developer",
//     requirements: { technologies: ["Css"], experience: 2 }
//   }

//   // Example test that calls the job fetching service
//   it('should fetch jobs from multiple providers', async () => {
//     const provider1Service = jobFetcherApp.get(Provider1Service);
//     const provider2Service = jobFetcherApp.get(Provider2Service);

//     const jobsFromProvider1 = await provider1Service.fetchJobs();
//     expect(jobsFromProvider1).toEqual([
//       {
//         externalId: job1.jobId,
//         employerName: job1.company.name, employerIndustry: job1.company.industry,
//         postedAt: job1.postedDate, 
//         provider: ProviderEnum.PROVIDER1,
//         title: job1.title,
//         currencyName: "USD", currencySymbol: "$", salaryMin: 100, salaryMax: 200,
//         experience: undefined,
//         employerWebsite: undefined,
//         isRemote: false,
//         jobType: job1.details.type,
//         locationCity: "Karaj", locationState: "Alborz",
//         skills: [...job1.skills]
//       }
//     ] as UnifiedJob[]);

//     const jobsFromProvider2 = await provider2Service.fetchJobs();
//     expect(jobsFromProvider2).toEqual([{ 
//       externalId: "job-2",
//       employerName: job2.employer.companyName, employerIndustry: undefined,   
//       postedAt: job2.datePosted, 
//       provider: ProviderEnum.PROVIDER2,
//       title: job2.position,
//       currencyName: job2.compensation.currency, 
//       currencySymbol: undefined, salaryMin: job2.compensation.min, salaryMax: job2.compensation.max,
//       experience: job2.requirements.experience,
//       employerWebsite: job2.employer.website,
//       isRemote: job2.location.remote,
//       jobType: undefined,
//       locationCity: job2.location.city, locationState: job2.location.state,
//       skills: [...job2.requirements.technologies]
//     }] as UnifiedJob[]);
//   });

  

// });