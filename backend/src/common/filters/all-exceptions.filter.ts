import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import type { Request, Response } from 'express';

/** The one error shape every endpoint returns. Documented in Swagger as `ErrorResponseDto`. */
export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Normalises every thrown error into `ErrorBody`.
 * - HttpExceptions keep their status and message (validation errors stay a `string[]`).
 * - Anything else is a 500 with a generic message: internals and stack traces never leak
 *   to the client, they go to the log with the request id for correlation.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id?: string | number }>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    if (isHttp) {
      const body = exception.getResponse();
      const reason = STATUS_CODES[statusCode] ?? 'Error';
      if (typeof body === 'string') {
        message = body;
        error = reason;
      } else {
        const b = body as { message?: string | string[]; error?: unknown };
        message = b.message ?? exception.message;
        error = typeof b.error === 'string' ? b.error : reason;
      }
    }

    if (statusCode >= 500) {
      this.logger.error(
        { err: exception, path: req.url, requestId: req.id },
        'Unhandled exception',
      );
    }

    const payload: ErrorBody = {
      statusCode,
      error,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
      requestId: req.id !== undefined ? String(req.id) : undefined,
    };
    res.status(statusCode).json(payload);
  }
}
