import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditEventsService } from './audit-events.service';

@Controller('audit-events-cron')
export class AuditEventsCronController {
  constructor(private readonly auditEventsService: AuditEventsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    await this.auditEventsService.processCleanAuditEvents();
  }
}
