import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { TgTextMessage, VideoInfo } from 'src/types';
import { Context } from 'telegraf';
import { MessagesService } from '../messages/messages.service';
import { ConfigService } from '@nestjs/config';
import { getMessage } from 'src/utils';
import { AuditEventsService } from '../audit-events/audit-events.service';
import { DownloadService } from '../download/download.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TelegramService {
  private ownerId: string;
  private botName: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly messageService: MessagesService,
    private readonly config: ConfigService,
    private readonly auditEventsService: AuditEventsService,
  ) {
    this.ownerId = this.config.get('OWNER_TG_ID');
    this.botName = this.config.get('BOT_NAME');
  }

  sendStartMessage(ctx: Context) {
    return ctx.replyWithHTML(getMessage('start'), {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: getMessage('startBtn'),
              url: `https://t.me/${this.botName}?startgroup`,
            },
          ],
        ],
      },
    });
  }

  sendStartNotiffication(ctx: Context) {
    return this.messageService.sendMessage(
      this.ownerId,
      getMessage('startNotiffication')(ctx.from.first_name, ctx.from.username),
    );
  }

  async handleVideo(ctx: Context, service: DownloadService) {
    const message = ctx.message as unknown as TgTextMessage;
    const { text: messageText, from, chat } = message;
    const isBotChat = from.id === chat.id;
    let footer = {};

    const videoInfo = await service.fetchPost(messageText);

    if (!videoInfo) {
      if (isBotChat) ctx.reply(getMessage('videoError'));
      throw new BadRequestException('This post is not available');
    }

    if (isBotChat) {
      footer = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: getMessage('footerPrivate'),
                url: videoInfo.url,
              },
            ],
          ],
        },
      };
    } else {
      footer = {
        caption: getMessage('footerPublic')(
          from.username || from.first_name,
          messageText,
        ),
      };
    }

    await this.replyWithVideo(ctx, videoInfo, footer);
    void this.auditEventsService.create(
      chat,
      from,
      videoInfo.downloadVia,
      videoInfo.service,
    );
  }

  async replyWithVideo(ctx: Context, videoInfo: VideoInfo, footer: any) {
    try {
      await ctx.replyWithVideo(videoInfo.url, {
        parse_mode: 'HTML',
        ...footer,
      });
    } catch {
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
    }
  }
}
