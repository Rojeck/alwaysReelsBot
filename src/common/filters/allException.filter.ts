import {
  ExceptionFilter,
  Catch,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  ICustomHttpExceptionResponse,
  IHttpExceptionResponse,
  TgTextMessage,
} from '../../types';
import { MessagesService } from 'src/modules/messages/messages.service';
import { LoggerService } from 'src/modules/logger/logger.service';
import { getMessage } from 'src/utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private ownerId: string;

  constructor(
    private logger: LoggerService,
    private messagesService: MessagesService,
    private config: ConfigService,
  ) {
    this.ownerId = this.config.get('OWNER_TG_ID');
  }

  catch(exception: any, host: any) {
    this.logger.error(exception);
    const isTelegramException = host?.contextType === 'telegraf';

    if (isTelegramException) {
      const { from, chat, text } = host.switchToRpc().getData().update
        .message as TgTextMessage;

      void this.messagesService.sendMessage(
        this.ownerId,
        getMessage('errorNotification')(chat, from, text, exception),
      );

      return;
    }

    let status: HttpStatus;
    let errorMessage: string;
    let error: string;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as Response;
    const request = ctx.getRequest() as Request;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse() as IHttpExceptionResponse;
      errorMessage = errorResponse.message?.toString() || exception.message;
      error = errorResponse.error || exception.constructor.name;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = exception.message;
      error = exception.constructor.name;
    }

    const errorResponse = this.getErrorResponse(
      status,
      errorMessage,
      request,
      error,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
    error: string,
  ): ICustomHttpExceptionResponse => ({
    statusCode: status,
    error: error,
    path: request.url,
    method: request.method,
    message: errorMessage,
    timeStamp: new Date(),
  });
}
