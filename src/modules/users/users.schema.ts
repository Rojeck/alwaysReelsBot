import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userTag: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export interface Users extends Document {
  readonly userId: string;
  readonly userTag: string;
  readonly createdAt: Date;
}
