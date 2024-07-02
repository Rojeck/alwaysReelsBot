import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditEventsModule } from '../audit-events/audit-events.module';
import { GroupsModule } from '../groups/groups.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { DownloadModule } from '../download/download.module';
import { options } from './telegram-config.factory';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 1,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 5,
      },
    ]),
    TelegrafModule.forRootAsync(options()),
    AuditEventsModule,
    MessagesModule,
    GroupsModule,
    UsersModule,
    DownloadModule,
  ],
  providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}
