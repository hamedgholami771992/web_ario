// unified-job.dto.ts

import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsArray,
    IsEnum,
    IsISO8601,
  } from 'class-validator';
  
  import { ProviderEnum } from '../../common/enums/provider.enum';
import { UnifiedJob } from '../../common/interfaces/unified-job.interface';
  
  export class UnifiedJobDto implements UnifiedJob {
    @IsEnum(ProviderEnum)
    provider: ProviderEnum;
  
    @IsString()
    externalId: string;
  
    @IsString()
    title: string;
  
    @IsString()
    employerName: string;
  
    @IsOptional()
    @IsString()
    employerWebsite?: string;
  
    @IsOptional() 
    @IsString()
    employerIndustry?: string;
  
    @IsOptional() 
    @IsString()
    locationCity?: string;
  
    @IsOptional() 
    @IsString()
    locationState?: string;
  
    @IsOptional() 
    @IsBoolean()
    isRemote?: boolean;
  
    @IsOptional() 
    @IsNumber()
    salaryMin?: number;
  
    @IsOptional() 
    @IsNumber()
    salaryMax?: number;
  
    @IsOptional() 
    @IsString()
    currencyName?: string;

    @IsOptional() 
    @IsString()
    currencySymbol?: string;
  
    @IsOptional() 
    @IsNumber()
    experience?: number;
  
    @IsOptional() 
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
  
    @IsISO8601()
    postedAt: string;
  
    @IsOptional() 
    @IsString()
    jobType?: string;
  
}
  