import { Ctx, On, Update, Start, Action, Command } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';
import { TgThrottlerGuard, TgMsgThrottlerGuard } from '../../common/guards';
import {
  ChatMemberStatus,
  ChatMemberUpdate,
  TgAction,
  TgTextMessage,
  VideoService,
} from '../../types';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { InstagramService } from '../download/instagram.service';
import { TelegramService } from './telegram.service';
import { MessagesService } from '../messages/messages.service';
import { getMessage, identifyVideoService, strToBoolean } from 'src/utils';
import { DownloadService } from '../download/download.service';
import { YouTubeService } from '../download/youtube.service';
import { TikTokService } from '../download/tiktok.service';
import { LoggerService } from '../logger/logger.service';
import { Throttle } from 'src/common/decorators';

type Context = SceneContext;

@Update()
export class TelegramUpdate {
  private isStartNotificationEnabled: boolean;
  private videoServices: { [key in VideoService]: DownloadService };
  private disabledBotServices: VideoService[];

  constructor(
    private readonly instagramService: InstagramService,
    private readonly youTubeService: YouTubeService,
    private readonly tikTokService: TikTokService,
    private readonly config: ConfigService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly messagesService: MessagesService,
    private readonly logger: LoggerService,
  ) {
    this.isStartNotificationEnabled = strToBoolean(
      this.config.get('ENABLE_NOTIFICATION_ON_START'),
    );
    this.disabledBotServices = [
      strToBoolean(this.config.get('IG_DISABLE')) && VideoService.IG,
      strToBoolean(this.config.get('TT_DISABLE')) && VideoService.TT,
      strToBoolean(this.config.get('YT_DISABLE')) && VideoService.YT,
    ].filter(Boolean);
    this.videoServices = {
      [VideoService.IG]: this.instagramService,
      [VideoService.YT]: this.youTubeService,
      [VideoService.TT]: this.tikTokService,
    };
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const { from, chat } = ctx.update['message'] as TgTextMessage;

    // prohibit start in another chat, except chat with a bot
    if (from.id !== chat.id) {
      return;
    }

    void this.telegramService.sendStartMessage(ctx);
    await this.usersService.createOrFindOne(from);

    if (this.isStartNotificationEnabled) {
      void this.telegramService.sendStartNotiffication(ctx);
    }
  }

  @Command('services')
  @Throttle(5, 300000)
  @UseGuards(TgThrottlerGuard)
  async change(@Ctx() ctx: Context) {
    const { from, chat } = ctx.message as unknown as TgTextMessage;

    if (chat.type === 'private') {
      return;
    }
    const user = await ctx.getChatMember(from.id);

    if (user.status === UserStatus.Member) {
      const message = await ctx.reply(getMessage('changeService.forbidden'));

      setTimeout(() => {
        ctx.deleteMessage(message.message_id).catch(() => {
          this.logger.error('Delete message error');
        });
      }, 5000);

      return;
    }

    const { disabledServices } = await this.groupsService.findOneByGroupId(
      String(chat.id),
    );

    const tmessage = await ctx.reply(getMessage('changeService.message'), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          ...generateArray(disabledServices),
          [
            {
              text: 'Cancel',
              callback_data: `service_change:cancel`,
            },
          ],
        ],
      },
    });
    await deleteUserMessage(ctx);
    setTimeout(() => {
      ctx.deleteMessage(tmessage.message_id).catch(() => {
        this.logger.error('Delete message error');
      });
    }, 1000 * 60 * 1); // 1 min
  }

  @On('text')
  @UseGuards(TgMsgThrottlerGuard)
  async onTextMessage(@Ctx() ctx: Context) {
    const disable = process.env.DISABLE;
    const message = ctx.message as unknown as TgTextMessage;
    const { text, from, chat } = message;
    const videoService = identifyVideoService(text);

    if (!videoService || disable) {
      return;
    }

    const { disabledServices = {} } =
      (await this.groupsService.findOneByGroupId(String(chat.id))) || {};

    if (disabledServices[videoService]) {
      return;
    }

    if (this.disabledBotServices.includes(videoService)) {
      if (from.id === chat.id) {
        await ctx.replyWithHTML(
          `Сервіс <strong>${videoService}</strong> тимчасово відключений. Вибачте за незручності!`,
        );
      }

      return;
    }

    await this.telegramService.handleVideo(
      ctx,
      this.videoServices[videoService],
    );
    await deleteUserMessage(ctx);
  }

  @On('my_chat_member')
  async onChatMember(@Ctx() ctx: Context) {
    const {
      chat,
      new_chat_member: { status },
      from,
    } = ctx.update['my_chat_member'] as ChatMemberUpdate;
    const isPrivate = chat.type === 'private';
    const isMember = status === ChatMemberStatus.MEMBER;
    const isLeft =
      status === ChatMemberStatus.LEFT || status === ChatMemberStatus.KICKED;

    if (isPrivate) {
      if (isMember) {
        await this.usersService.createOrFindOne(from);
      } else if (isLeft) {
        await this.usersService.removeByUserId(from.id);
      }
    } else {
      if (isMember) {
        this.groupsService.createOrFindOne(chat, from);
      } else if (isLeft) {
        await this.groupsService.removeByGroupId(chat.id);
      }
    }
  }

  @Action(/^service_change.*/)
  async onMessageServiceChangeAction(@Ctx() ctx: Context) {
    const { from, data, message } = ctx.update['callback_query'] as TgAction;
    const { chat } = message;
    const [, value] = data.split(':');
    const user = await ctx.getChatMember(from.id);

    if (user.status === UserStatus.Member) {
      return;
    }

    if (value === 'cancel') {
      await ctx.deleteMessage();
      return;
    }

    const { disabledServices } = await this.groupsService.toggleService(
      String(chat.id),
      value as VideoService,
    );

    await ctx.editMessageText(getMessage('changeService.message'), {
      reply_markup: {
        inline_keyboard: [
          ...generateArray(disabledServices),
          [
            {
              text: 'Cancel',
              callback_data: `service_change:cancel`,
            },
          ],
        ],
      },
    });
  }

  @Action(/^message_job.*/)
  async onMessageJobAction(@Ctx() ctx: Context) {
    void this.messagesService.handleMessageJobAction(ctx);
  }
}

function generateArray(
  data = {
    [VideoService.TT]: false,
    [VideoService.YT]: false,
    [VideoService.IG]: false,
  },
) {
  const services = [
    { name: VideoService.TT, label: 'TikTok' },
    // { name: VideoService.YT, label: 'YouTube Shorts' },
    { name: VideoService.IG, label: 'Instagram Reels' },
  ];

  return services.map((service) => {
    let status = data[service.name];
    if (status === undefined) {
      status = true;
    }

    const text = status ? `❌ ${service.label}` : `✅ ${service.label}`;
    const callbackData = `service_change:${service.name}`;

    return [
      {
        text: text,
        callback_data: callbackData,
      },
    ];
  });
}

enum UserStatus {
  Creator = 'creator',
  Member = 'member',
  Admin = 'administrator',
}

async function deleteUserMessage(ctx: Context) {
  // prohibit attempt to delete message inside bot
  if (ctx.message.from.id === ctx.chat.id) {
    return;
  }

  ctx.deleteMessage().catch(() => {
    null;
  });
}
