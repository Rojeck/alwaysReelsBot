import { Connection } from 'mongoose';
import { DATABASE_CONNECTION } from 'src/database';
import { AuditEventsSchema } from './audit-events.schema';

export const AUDIT_EVENTS_MODEL = 'AUDIT_EVENTS_MODEL';

export const auditEventsProviders = [
  {
    provide: AUDIT_EVENTS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Audit_Events', AuditEventsSchema),
    inject: [DATABASE_CONNECTION],
  },
];
