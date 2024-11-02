import { Ctx, On, Update, Start, Action } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';
import { TgMsgThrottlerGuard } from '../../common/guards';
import {
  ChatMemberStatus,
  ChatMemberUpdate,
  TgTextMessage,
  VideoService,
} from '../../types';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { InstagramService } from '../download/instagram.service';
import { TelegramService } from './telegram.service';
import { MessagesService } from '../messages/messages.service';
import { identifyVideoService, strToBoolean } from 'src/utils';
import { DownloadService } from '../download/download.service';
import { YouTubeService } from '../download/youtube.service';

type Context = SceneContext;

@Update()
export class TelegramUpdate {
  private isStartNotificationEnabled: boolean;
  private videoServices: { [key in VideoService]: DownloadService };

  constructor(
    private readonly instagramService: InstagramService,
    private readonly youTubeService: YouTubeService,
    private readonly config: ConfigService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly messagesService: MessagesService,
  ) {
    this.isStartNotificationEnabled = strToBoolean(
      this.config.get('ENABLE_NOTIFICATION_ON_START'),
    );
    this.videoServices = {
      [VideoService.IG]: this.instagramService,
      [VideoService.YT]: this.youTubeService,
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

  @On('text')
  @UseGuards(TgMsgThrottlerGuard)
  async onTextMessage(@Ctx() ctx: Context) {
    const disable = process.env.DISABLE;
    const message = ctx.message as unknown as TgTextMessage;
    const { text } = message;
    const videoService = identifyVideoService(text);

    if (!videoService || disable) {
      return;
    }

    await this.telegramService.handleVideo(
      ctx,
      this.videoServices[videoService],
    );
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

  @Action(/^message_job.*/)
  async onMessageJobAction(@Ctx() ctx: Context) {
    void this.messagesService.handleMessageJobAction(ctx);
  }
}
