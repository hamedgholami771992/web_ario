import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsISO8601,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Provider2ApiResponse, Provider2Job } from '../interfaces/provider2-api-response.interface';


class Provider2LocationDto {
  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsBoolean()
  remote: boolean;
}

class Provider2CompensationDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;

  @IsString()
  currency: string;
}

class Provider2EmployerDto {
  @IsString()
  companyName: string;

  @IsOptional() // Website might not always be present
  @IsString()
  website?: string;
}

class Provider2RequirementsDto {
  @IsOptional() // Not sure if experience always present
  @IsNumber()
  experience?: number;

  @IsArray()
  @IsString({ each: true })
  technologies: string[];
}

class Provider2DataDto {
  @ValidateNested({ each: true })
  @Type(() => Provider2JobDto)
  jobsList: Record<string, Provider2JobDto>;
}

export class Provider2JobDto implements Provider2Job {
  @IsString()
  position: string;

  @ValidateNested()
  @Type(() => Provider2LocationDto)
  location: Provider2LocationDto;

  @ValidateNested()
  @Type(() => Provider2CompensationDto)
  compensation: Provider2CompensationDto;

  @ValidateNested()
  @Type(() => Provider2EmployerDto)
  employer: Provider2EmployerDto;

  @ValidateNested()
  @Type(() => Provider2RequirementsDto)
  requirements: Provider2RequirementsDto;

  @IsISO8601({ strict: false }) // YYYY-MM-DD not full ISO
  datePosted: string;

}

export class Provider2ApiResponseDto implements Provider2ApiResponse {
  @IsString()
  status: string; // 'success'

  @ValidateNested()
  @Type(() => Provider2DataDto)
  data: Provider2DataDto;
}
