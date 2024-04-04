import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { TelegrafModule } from 'nestjs-telegraf';
import options from './telegram-config.factory';
import { PrismaService } from '../../services/prisma.service';
import { NotificationService } from '../../services/notification.service';
import { LoggerService } from '../../services/logger.service';
import { ConfigService } from '@nestjs/config';
import { InstagramService } from '../../services/instagram/instagram.service';
import { HttpModule } from '@nestjs/axios';
import { AuditEventsModule } from '../audit-events/audit-events.module';
import { AuditEventsService } from '../audit-events/audit-events.service';
import { ThrottlerModule } from '@nestjs/throttler';

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
    HttpModule,
    AuditEventsModule,
  ],
  providers: [
    TelegramUpdate,
    InstagramService,
    PrismaService,
    AuditEventsService,
    NotificationService,
    LoggerService,
    ConfigService,
  ],
})
export class TelegramModule {}
