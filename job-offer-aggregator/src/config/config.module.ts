import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import {validationSchema} from './env.validation'
import configuration from './configuration'

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env', 
      validationSchema,
      load: [configuration],
    }),
  ],
})
export class ConfigModule { }






