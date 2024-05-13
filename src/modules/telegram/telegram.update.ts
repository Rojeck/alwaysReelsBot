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
import {
  footerBtnMsgEng,
  footerBtnMsgUk,
  startMsgBtnTextEng,
  startMsgBtnTextUk,
  startMsgEng,
  startMsgUk,
} from '../../constants';
import axios from 'axios';

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
    const { from, chat } = (ctx.update as any)?.message as TgTextMessage;

    // prohibit start in another chat, except chat with a bot
    if (from.id !== chat.id) {
      return;
    }

    const startMessage = from.language_code === 'uk' ? startMsgUk : startMsgEng;
    const buttonText =
      from.language_code === 'uk' ? startMsgBtnTextUk : startMsgBtnTextEng;

    await ctx.replyWithHTML(startMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: buttonText,
              url: 'https://t.me/AlwaysReels_bot?startgroup',
            },
          ],
        ],
      },
    });

    if (isStartNotificationEnabled) {
      void this.notificationService.sendNotification(
        this.config.get('OWNER_TG_ID'),
        `NOTIFICATION: Somebody called /start.
       Name: ${ctx.from.first_name}, 
       Tag: ${ctx.from.username}`,
      );
    }
  }

  @On('text')
  @UseGuards(TgMsgThrottlerGuard)
  async onTextMessage(@Ctx() ctx: Context) {
    const message = ctx.message as unknown as TgTextMessage;
    const { text: messageText, from, chat } = message;
    let footer = {};

    if (!reelsCheck(messageText)) {
      return;
    }

    const isBotChat = from.id === chat.id;
    const videoInfo = await this.instagramService.fetchPostJSON(messageText);
    const buttonText =
      from.language_code === 'uk' ? footerBtnMsgUk : footerBtnMsgEng;

    if (isBotChat) {
      footer = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: buttonText,
                url: videoInfo.url,
              },
            ],
          ],
        },
      };
    } else {
      footer = {
        caption: `<b>From:</b> @${
          from.username || from.first_name
        }  \n<b>Original</b>: <a href="${messageText}">Link</a>`,
      };
    }

    await ctx
      .replyWithVideo(videoInfo.url, {
        parse_mode: 'HTML',
        ...footer,
      })
      .catch(async () => {
        const response = await axios.get(videoInfo.url, {
          responseType: 'stream',
        });
        const { data: thumbnail } = await axios.get(videoInfo.thumbnail, {
          responseType: 'stream',
        });

        await ctx.replyWithVideo(
          { source: response.data },
          {
            thumbnail: {
              source: thumbnail,
            },
            width: videoInfo.width,
            height: videoInfo.height,
            duration: videoInfo.duration,
            ...footer,
            parse_mode: 'HTML',
          },
        );
      });

    await this.auditEventsService.create(messageText, chat, from);
  }
}
