import { Controller, Get, Query, UsePipes, ValidationPipe, BadRequestException, Logger, Post, Body, Header } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobOffersQueryDto } from './dto/job-offers-query.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoggerService } from '@/common/logger/logger.service';

@Controller()
export class JobsController {

  constructor(
    private readonly jobsService: JobsService,
    private readonly logger: LoggerService
  
  ) {}

  @Post('api/job-offers')
  @ApiOperation({ summary: 'Find job offers with optional filters' })
  @ApiBody({ type: JobOffersQueryDto })
  @ApiResponse({ status: 200, description: 'List of matching job offers' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Body() query: JobOffersQueryDto) {
    try {
      return await this.jobsService.findJobs(query);
      
    } catch (err) {
      this.logger.error('Error fetching job offers', err);
      // Normalize error for client
      throw new BadRequestException(err.message || 'Failed to fetch job offers');
    }
  }
}
