import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';
import { LoggerService } from '@/common/logger/logger.service';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { runSeeders } from '@/database/seed';
import { ProviderEnum } from '@/common/enums/provider.enum';
import { JobApiModule } from './job-api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(JobApiModule)
    const configService: ConfigService<EnvironmentVarTypes> = await appContext.get(ConfigService)
    const loggerService = appContext.get(LoggerService);


    const app = await NestFactory.create(JobApiModule);
    // Start RabbitMQ microservice listener
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get('rabbitmq.url', { infer: true })],
            queue: configService.get("rabbitmq.jobApiQueue", { infer: true }),  //listens to
            queueOptions: { durable: true },
        },
    });

    // Swagger configuration
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Job Offers API')
        .setDescription('API documentation for Job Offers Management')
        .setVersion('1.0')
        .addTag('Job Offers')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    app.useLogger(loggerService)
    app.useGlobalFilters(new AllExceptionsFilter(loggerService));

    await app.startAllMicroservices();
    await app.listen(configService.get("jobApi.port", { infer: true }) || 3000);


}
bootstrap();
