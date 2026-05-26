import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.getResponse() as { message: string } | string;

    const errorResponse = {
      code: status,
      message: typeof message === 'string' ? message : message.message,
      data: null,
      timestamp: Date.now(),
      path: request.url
    };

    this.logger.error(`HTTP Error: ${status} - ${errorResponse.message} - ${request.url}`);

    response.status(status).json(errorResponse);
  }
}
