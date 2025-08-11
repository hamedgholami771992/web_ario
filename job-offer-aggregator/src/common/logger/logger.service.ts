import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as path from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';



function getContextInfo(): { file: string; function: string; line: number } {
  try {
    const originalPrepare = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    const stack = err.stack as unknown as NodeJS.CallSite[];
    Error.prepareStackTrace = originalPrepare;

    const ignoredFiles = ['logger.service', 'node_modules'];
    const caller =
      stack.find(
        frame => {
          const file = frame.getFileName() ?? '';
          return file && !ignoredFiles.some(ignored => file.includes(ignored));
        },
      ) || stack[0];

    const file = caller?.getFileName()
      ? path.basename(caller.getFileName())
      : 'unknown';

    const func = caller?.getFunctionName() || caller?.getMethodName() || 'anonymous';
    const line = caller?.getLineNumber() || 0;

    return { file, function: func, line };
  } catch {
    return { file: 'unknown', function: 'unknown', line: 0 };
  }
}


@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';

    this.logger = createLogger({
      level: isProd ? 'warn' : 'debug',
      format: isProd
        ? format.combine(
          format.timestamp(),
          format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
          })
        )
        : format.combine(
          format.colorize(),
          format.timestamp(),
          format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
          }),
        ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'EmailSender-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  private formatMessage(message: string): string {
    const { file, function: fn, line } = getContextInfo();
    return `[${file}:::${fn}:::${line}] ${message}`;
  }

  log(message: string) {
    this.logger.info(this.formatMessage(message));
  }

  error(message: string, trace?: any) {
    let traceOutput = '';
  
    if (trace instanceof Error) {
      traceOutput = trace.stack ?? trace.message;
    } else if (trace) {
      // If trace exists but isn't an Error, try JSON stringify safely
      try {
        traceOutput = JSON.stringify(trace, null, 2);
      } catch {
        traceOutput = String(trace);
      }
    }
  
    this.logger.error(`${this.formatMessage(message)}\n${traceOutput}`);
  }

  warn(message: string) {
    this.logger.warn(this.formatMessage(message));
  }

  debug(message: string) {
    this.logger.debug(this.formatMessage(message));
  }

  verbose(message: string) {
    this.logger.verbose(this.formatMessage(message));
  }
}
