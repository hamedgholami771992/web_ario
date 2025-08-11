import { IsOptional, IsString, IsBooleanString, IsInt, Min, IsNumberString, IsEnum, IsBoolean, IsNumber, IsArray, IsISO8601, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderEnum } from '@/common/enums/provider.enum';
import { boolean, number, string } from 'joi';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobOffersQueryDto {
    @ApiPropertyOptional({ description: 'Job title or keywords to search for', example: 'Software Engineer' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'City where the job is located', example: 'Tehran' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'State / province where the job is located', example: 'Khorasan Razavi' })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ description: 'Whether the position is remote', example: true, type: Boolean })
    @IsOptional()
    @Type(() => boolean)
    @IsBoolean()
    isRemote?: boolean;


    @ApiPropertyOptional({ description: 'Minimum salary offered', example: 50000, type: Number })
    @IsOptional()
    @Type(() => number)
    @IsNumber()
    minSalary?: number;

    @ApiPropertyOptional({ description: 'Maximum salary offered', example: 120000, type: Number })
    @IsOptional()
    @Type(() => number)
    @IsNumber()
    maxSalary?: number;

    @ApiPropertyOptional({ description: 'Salary currency', example: 'USD' })
    @IsOptional()
    @IsString()
    currency?: string

    @ApiPropertyOptional({ description: 'Type of job (e.g., Full-time, Part-time, Contract)', example: 'Full-time' })
    @IsOptional()
    @IsString()
    jobType?: string;

    @ApiPropertyOptional({ description: 'List of required skills', example: ['JavaScript', 'NestJS', 'PostgreSQL'], type: [String] })
    @IsOptional()
    @IsArray()
    @Type(() => string)
    skills?: string[]

    @ApiPropertyOptional({ description: 'Years of experience required', example: 3, type: Number })
    @IsOptional()
    @Type(() => number)
    experience?: number

    @ApiPropertyOptional({ description: 'Name of the employer', example: 'TechCorp' })
    @IsOptional()
    @IsString()
    employerName?: string;
  
    @ApiPropertyOptional({ description: 'Industry of the employer', example: 'Information Technology' })
    @IsOptional()
    @IsString()
    employerIndustry?: string;

    @ApiPropertyOptional({ description: 'Only return jobs posted on or after this date', example: '2025-01-01T00:00:00Z', type: String, format: 'date-time' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fromDate?: Date
  
    @ApiPropertyOptional({ description: 'Only return jobs posted on or before this date', example: '2025-08-01T00:00:00Z', type: String, format: 'date-time' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    toDate?: Date

    @ApiPropertyOptional({ description: 'Page number for pagination (minimum 1)', example: 1, type: Number, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of results per page (minimum 1)', example: 20, type: Number, default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
