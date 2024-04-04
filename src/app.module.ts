import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggerService } from './services/logger.service';
import { AllExceptionsFilter } from './common/filters/allException.filter';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './services/notification.service';
import { AuditEventsModule } from './modules/audit-events/audit-events.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule,
    AuditEventsModule,
    AuthModule,
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
    NotificationService,
  ],
})
export class AppModule {}
