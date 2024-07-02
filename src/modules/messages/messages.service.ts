import { Inject, Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectBot } from 'nestjs-telegraf';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MessageJobDto } from './dto';
import { delay, getMessage } from 'src/utils';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { TgAction, TgDocument } from 'src/types';
import { Readable } from 'stream';

@Injectable()
export class MessagesService {
  private ownerId: string;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
    private groupsService: GroupsService,
    private usersService: UsersService,
  ) {
    this.ownerId = this.config.get('OWNER_TG_ID');
  }

  async sendMessageJobApproveReq(data: MessageJobDto) {
    const jobId = randomUUID();

    await this.cacheManager.set(jobId, data, 60 * 1000); // 1 min
    await this.sendMessage(this.ownerId, data.message, {
      inline_keyboard: [
        [
          {
            text: getMessage('jobs.messages.approveBtn'),
            callback_data: `message_job:${jobId}`,
          },
          {
            text: getMessage('jobs.messages.cancelBtn'),
            callback_data: `message_job:${jobId}:cancel`,
          },
        ],
      ],
    });
  }

  async handleMessageJobAction(ctx: Context) {
    const { from, data } = ctx.update['callback_query'] as TgAction;
    const [, jobId, action] = data.split(':');
    const isCancelled = action === 'cancel';

    if (isCancelled) {
      this.cacheManager.del(jobId);
      return ctx.deleteMessage();
    }

    if (from.id !== +this.ownerId) {
      return ctx.replyWithHTML(getMessage('jobs.messages.ownerError'));
    }

    const jobData = await this.cacheManager.get<MessageJobDto>(jobId);

    if (!jobData) {
      ctx.deleteMessage();
      return ctx.replyWithHTML(getMessage('jobs.messages.emptyDataError'));
    }

    ctx.deleteMessage();
    this.cacheManager.del(jobId);
    void this.runMessageJob(jobData);
  }

  private async runMessageJob(data: MessageJobDto) {
    const { users: usersArr, groups: groupsArr, message } = data;

    const fetchIds = async (arr, service, key) => {
      if (!arr) return [];

      return Array.isArray(arr)
        ? arr
        : (await service.findAll()).map((item) => item[key]);
    };

    const users = await fetchIds(usersArr, this.usersService, 'userId');
    const groups = await fetchIds(groupsArr, this.groupsService, 'groupId');

    let successCount = 0;
    let failureCount = 0;

    await this.sendMessage(this.ownerId, getMessage('jobs.messages.start'));

    const startTime = performance.now();

    const sendAndHandle = async (id, removeFunc) => {
      try {
        await this.sendMessage(id, message);
        successCount++;
      } catch (error) {
        failureCount++;
        if (error.response?.error_code === 403) {
          await removeFunc(id);
        }
      }
      await delay(5000);
    };

    for (const groupId of groups) {
      await sendAndHandle(
        groupId,
        this.groupsService.removeByGroupId.bind(this.groupsService),
      );
    }

    for (const userId of users) {
      await sendAndHandle(
        userId,
        this.usersService.removeByUserId.bind(this.usersService),
      );
    }

    const endTime = performance.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    await this.sendMessage(
      this.ownerId,
      getMessage('jobs.messages.finish')(
        elapsedTime,
        successCount,
        failureCount,
      ),
    );
  }

  async sendMessage(
    receiverId: string | number,
    message: string,
    replyMarkup?:
      | InlineKeyboardMarkup
      | ReplyKeyboardMarkup
      | ReplyKeyboardRemove
      | ForceReply,
  ) {
    await this.bot.telegram.sendMessage(receiverId, message, {
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
  }

  async sendFile(receiverId: string | number, document: TgDocument) {
    const stream = new Readable();
    stream.push(document.buffer);
    stream.push(null);

    await this.bot.telegram.sendDocument(receiverId, {
      source: stream,
      filename: document.name,
    });
  }
}
