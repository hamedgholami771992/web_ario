// src/dto/provider1-job.dto.ts

import {
  IsString,
  IsArray,
  IsISO8601,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Provider1ApiResponse, Provider1Job } from '../interfaces/provider1-api-response.interface';

class Provider1DetailsDto {
  @IsString()
  location: string; // city, state, country (always present)

  @IsString()
  type: string; // e.g. "Full-Time" (always present)

  @IsString()
  salaryRange: string; // e.g. "$72k - $119k" (always present)
}

class Provider1CompanyDto {
  @IsString()
  name: string;

  @IsString()
  industry: string;
}

export class Provider1JobDto implements Provider1Job{
  @IsString()
  jobId: string;

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => Provider1DetailsDto)
  details: Provider1DetailsDto;

  @ValidateNested()
  @Type(() => Provider1CompanyDto)
  company: Provider1CompanyDto;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsISO8601()
  postedDate: string;

}

class Provider1MetadataDto {
  @IsString()
  requestId: string;

  @IsISO8601()
  timestamp: string;
}


export class Provider1ApiResponseDto implements Provider1ApiResponse{
  @ValidateNested()
  @Type(() => Provider1MetadataDto)
  metadata: Provider1MetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Provider1JobDto)
  jobs: Provider1JobDto[];
}

