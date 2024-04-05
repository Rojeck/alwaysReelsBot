import { Ctx, On, Update, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { NotificationService } from '../../services/notification.service';
import { InstagramService } from '../../services/instagram/instagram.service';
import { TgTextMessage } from '../../types/telegram';
import { AuditEventsService } from '../audit-events/audit-events.service';
import { ConfigService } from '@nestjs/config';
import { reelsCheck } from '../../utils/instagram';
import { UseGuards } from '@nestjs/common';
import { TgMsgThrottlerGuard } from '../../common/guards/TgMsgThrottler.guard';

type Context = SceneContext;

@Update()
export class TelegramUpdate {
  constructor(
    private readonly auditEventsService: AuditEventsService,
    private readonly instagramService: InstagramService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const isStartNotificationEnabled = this.config.get(
      'ENABLE_NOTIFICATION_ON_START',
    );

    if (isStartNotificationEnabled) {
      void this.notificationService.sendNotification(
        this.config.get('OWNER_TG_ID'),
        `NOTIFICATION: Somebody called /start.
       Name: ${ctx.from.first_name}, 
       Tag: ${ctx.from.username}`,
      );
    }

    await ctx.replyWithHTML(
      `<b>Бот для парсингу Instagram Reels</b>
Просто добавте бота у вашу телеграм групу та <b>надайте йому доступ до повідомлень</b>.
\n<b>Bot for parsing Instagram Reels</b>
Just add the bot to your Telegram group and <b>give it access to messages</b>.`,
    );
  }

  @On('text')
  @UseGuards(TgMsgThrottlerGuard)
  async onTextMessage(@Ctx() ctx: Context) {
    const message = ctx.message as unknown as TgTextMessage;
    const { text: messageText, from, chat } = message;

    if (chat.id === from.id || from.is_bot) {
      return;
    }

    if (!reelsCheck(messageText)) {
      return;
    }

    const caption = `<b>From:</b> @${
      from.username || from.first_name
    }  \n<b>Original</b>: <a href="${messageText}">Link</a>`;

    const videoUrl = await this.instagramService.fetchPostJSON(messageText);

    await ctx.replyWithVideo(videoUrl, {
      parse_mode: 'HTML',
      caption,
    });
    await this.auditEventsService.create(messageText, chat, from);
  }
}
