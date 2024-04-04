import { Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { LoggerService } from './logger.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private logger: LoggerService,
  ) {}

  async sendNotification(userTgId: string | number, message: string) {
    await this.bot.telegram
      .sendMessage(userTgId, message, { parse_mode: 'HTML' })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
