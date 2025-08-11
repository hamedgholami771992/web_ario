import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../logger/logger.service'; // Assuming the logger is in shared

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) { }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (ctx.getRequest().url.startsWith('/.well-known/')) {
      return;
    }

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Extract useful info
    const errorBody =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;

    const formattedResponse = {
      statusCode: status,
      ...(errorBody as object),
    };


    this.logger.error(
      `[Exception] ${exception.name || 'UnknownError'} - ${exception.message}:  \n${JSON.stringify(exception)}`,
      exception.stack,

    );

    response.status(status).json(formattedResponse);

  }
}





