import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './provider.entity';
import { ProviderEntitiesService } from './providers-entities.service';
import { ProviderRepository } from './provider.repository';
import { DataSource } from 'typeorm';
import { ProviderCacheService } from './provider-cache.service';

@Module({
    imports: [TypeOrmModule.forFeature([Provider])],
    providers: [
        ProviderEntitiesService,
        ProviderCacheService,
        {
            provide: ProviderRepository,
            useFactory: (dataSource: DataSource) => {
                return new ProviderRepository(dataSource);
            },
            inject: [DataSource],
        }
    ],
    exports: [TypeOrmModule, ProviderEntitiesService, ProviderCacheService],
})
export class ProviderEntitiesModule { }
