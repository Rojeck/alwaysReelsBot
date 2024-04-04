import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ILogger } from '../types';

@Injectable()
export class LoggerService extends ConsoleLogger implements ILogger {
  setContext(context: string) {
    super.setContext(context);
  }
}
