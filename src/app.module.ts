import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggerService } from './modules/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/allException.filter';
import { ConfigModule } from '@nestjs/config';
import { AuditEventsModule } from './modules/audit-events/audit-events.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessagesModule } from './modules/messages/messages.module';
import { LoggerModule } from './modules/logger/logger.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      ttl: Number(process.env.REDIS_TTL) || 1000 * 60 * 60 * 24 * 2, // 2d
    }),
    AuditEventsModule,
    AuthModule,
    MessagesModule,
    TelegramModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'ILogger',
      useClass: LoggerService,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    LoggerService,
  ],
})
export class AppModule {}
