import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const timestamp = new Date().toISOString();

    this.loggerService.log(`Incoming Request: ${method} ${url} at ${timestamp}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          this.loggerService.log(`Completed Request: ${method} ${url} at ${new Date().toISOString()}`),
        ),
      );
  }
}
