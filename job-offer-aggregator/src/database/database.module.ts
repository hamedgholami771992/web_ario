import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarTypes } from '@/config/env.types';
import { ConfigModule } from '@/config/config.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVarTypes, true>) => {
        const dbConfig = configService.get('database', { infer: true })!;
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'postgres',
            host: dbConfig.host,
            port: dbConfig.port+1,
            username: dbConfig.username,
            password: dbConfig.password,
            database: `${dbConfig.database}_test`,
            autoLoadEntities: true,
            synchronize: true, // or use migrations if you prefer
            dropSchema: true,   // reset DB on each test run
            logging: false,
          };
        } 

        
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          autoLoadEntities: true, // No need to manually list every entity
          synchronize: configService.get('nodeEnv', { infer: true }) !== 'production', // Avoid auto-sync in prod
          logging: configService.get('nodeEnv', { infer: true }) === 'development',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
