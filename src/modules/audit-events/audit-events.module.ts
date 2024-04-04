import { Module } from '@nestjs/common';
import { AuditEventsService } from './audit-events.service';
import { AuditEventsController } from './audit-events.controller';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [AuditEventsController],
  providers: [AuditEventsService, PrismaService],
})
export class AuditEventsModule {}
