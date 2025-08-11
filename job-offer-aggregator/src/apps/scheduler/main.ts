import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';
import { LoggerService } from '@/common/logger/logger.service';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { SchedulerWrapperModule } from './scheduler.module';


async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SchedulerWrapperModule)
    const configService: ConfigService<EnvironmentVarTypes> = await appContext.get(ConfigService)
    const loggerService = appContext.get(LoggerService);


    const app = await NestFactory.createMicroservice(SchedulerWrapperModule, {
        transport: Transport.RMQ,
        options: {
            urls: [configService.get("rabbitmq.url", {infer: true})],
            queue: configService.get("rabbitmq.schedulerQueue", {infer: true}), //listens to this queue
            queueOptions: { durable: true },
        },
        bufferLogs: true
    });
    app.useLogger(loggerService)
    app.useGlobalFilters(new AllExceptionsFilter(loggerService));

    await app.listen();
}
bootstrap();
