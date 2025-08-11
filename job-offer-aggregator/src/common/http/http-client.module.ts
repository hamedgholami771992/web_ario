import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@/config/config.module';
import { EnvironmentVarTypes } from '@/config/env.types';

@Module({
    imports: [
        ConfigModule,
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService<EnvironmentVarTypes, true>) => ({
                timeout: config.get('http.fetchTimeout', {infer: true}) || 5000,
             
            }),
        }),
    ],
    exports: [HttpModule], // re-export so consumers just import this
})
export class HttpClientModule { }
