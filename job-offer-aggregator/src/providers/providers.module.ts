import { Module } from '@nestjs/common';
import { Provider1Service } from './provider1/provider1.service';
import { Provider1Transformer } from './provider1/provider1.transformer';
import { LoggerModule } from '@/common/logger/logger.module';
import { ProvidersService } from './providers.service';
import { Provider2Service } from './provider2/provider2.service';
import { Provider2Transformer } from './provider2/provider2.transformer';
import { HttpClientModule } from '@/common/http/http-client.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';
import { ProvidersEventHandler } from './providers-event.controller';

@Module({
    imports: [
        LoggerModule,
        HttpClientModule,
        ClientsModule.registerAsync([{
            name: "JOB_API_CLIENT",
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<EnvironmentVarTypes, true>) => ({
                transport: Transport.RMQ,
                options: {
                    urls: [configService.get<string>('rabbitmq.url', { infer: true })],
                    queue: configService.get('rabbitmq.jobApiQueue', { infer: true }),  //emits into this queu
                    queueOptions: { durable: true },
                }

            }),
        }
        ])
    ],
    providers: [
        Provider1Service,
        Provider2Service,
        Provider1Transformer,
        Provider2Transformer,
        ProvidersService,
        
    ],
    controllers: [ProvidersEventHandler],
    exports: [ProvidersService],
})
export class ProvidersModule { }
