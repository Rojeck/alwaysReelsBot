import { Connection } from 'mongoose';
import { DATABASE_CONNECTION } from 'src/database';
import { GroupsSchema } from './groups.schema';

export const GROUPS_MODEL = 'GROUPS_MODEL';

export const groupsProviders = [
  {
    provide: GROUPS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Groups', GroupsSchema),
    inject: [DATABASE_CONNECTION],
  },
];
