import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './skill.entity';
import { SkillsService } from './skills.service';
import { SkillRepository } from './skill.repository';
import { DataSource } from 'typeorm';
import { LoggerModule } from '@/common/logger/logger.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Skill]),
        LoggerModule
    ],
    providers: [
        SkillsService,
        {
            provide: SkillRepository,
            useFactory: (dataSource: DataSource) => {
                return new SkillRepository(dataSource);
            },
            inject: [DataSource],
        },
    ],
    exports: [TypeOrmModule, SkillsService],
})
export class SkillsModule { }
