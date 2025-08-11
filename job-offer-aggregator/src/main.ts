import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EnvironmentVarTypes } from './config/env.types'
import { runSeeders } from './database/seed'
import { ProviderEnum } from './common/enums/provider.enum';


async function bootstrap() {


  const appContext = await NestFactory.createApplicationContext(AppModule)
  const configService: ConfigService<EnvironmentVarTypes> = await appContext.get(ConfigService)
  const loggerService = appContext.get(LoggerService);

  await runSeeders([
    {
      name: ProviderEnum.PROVIDER1,
      address: configService.get('jobApi.provider1Address', { infer: true })
    },
    {
      name: ProviderEnum.PROVIDER2,
      address: configService.get('jobApi.provider2Address', { infer: true })
    },
  ]) //to seed the database before start

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(loggerService)
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));
  await app.listen(
    configService.get('jobApi.port', { infer: true })
    ?? 3000);
}
bootstrap();
