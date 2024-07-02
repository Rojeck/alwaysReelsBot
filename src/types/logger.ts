import { LoggerService } from '@nestjs/common';

export interface ILogger extends LoggerService {
  setContext(context: string): void;
}
