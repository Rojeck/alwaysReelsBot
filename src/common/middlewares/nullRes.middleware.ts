import { LoggerService } from '../../services/logger.service';
import { Context } from 'telegraf';

const logger = new LoggerService('TELEGRAF_MIDDLEWARE');

// eslint-disable-next-line @typescript-eslint/ban-types
export default async (ctx: Context, next: Function) => {
  try {
    await next();
  } catch (error) {
    logger.error(error);
  }
};
