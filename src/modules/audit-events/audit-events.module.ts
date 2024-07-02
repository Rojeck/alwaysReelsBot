import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { auditEventsProviders } from './audit-events.providers';
import { AuditEventsController } from './audit-events.controller';
import { AuditEventsService } from './audit-events.service';
import { MessagesModule } from '../messages/messages.module';
import { AuditEventsCronController } from './audit-events.cron.controller';

@Module({
  imports: [DatabaseModule, MessagesModule],
  controllers: [AuditEventsController, AuditEventsCronController],
  providers: [AuditEventsService, ...auditEventsProviders],
  exports: [AuditEventsService, ...auditEventsProviders],
})
export class AuditEventsModule {}
