import { Connection } from 'mongoose';
import { DATABASE_CONNECTION } from 'src/database';
import { UsersSchema } from './users.schema';

export const USERS_MODEL = 'USERS_MODEL';

export const usersProviders = [
  {
    provide: USERS_MODEL,
    useFactory: (connection: Connection) =>
      connection.model('Users', UsersSchema),
    inject: [DATABASE_CONNECTION],
  },
];
