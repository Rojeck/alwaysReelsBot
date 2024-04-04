import {
  ExceptionFilter,
  Catch,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { LoggerService } from '../../services/logger.service';
import { NotificationService } from '../../services/notification.service';
import { TgTextMessage } from '../../types/telegram';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  ICustomHttpExceptionResponse,
  IHttpExceptionResponse,
} from '../../types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private logger: LoggerService,
    private notificationService: NotificationService,
    private config: ConfigService,
  ) {}

  catch(exception: any, host: any) {
    this.logger.error(exception);
    const isTelegramException = host?.contextType === 'telegraf';

    if (isTelegramException) {
      const { from, chat, text } = host.switchToRpc().getData().update
        .message as TgTextMessage;

      void this.notificationService.sendNotification(
        this.config.get('OWNER_TG_ID'),
        `ERROR: telegram error, exception: ${exception},
        <b>HostInfo</b>: 
        userName - ${from.first_name}, 
        userTag ${from.username},
        userId: ${from.id}, 
        chatName: ${chat.title}, 
        chatId: ${chat.id},
        chatType: ${chat.type},
        messageText: ${text}`,
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
