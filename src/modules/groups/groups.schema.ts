import * as mongoose from 'mongoose';

export const GroupsSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupName: { type: String, required: true },
  addedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface Groups extends Document {
  readonly groupId: string;
  readonly groupName: string;
  readonly addedBy: string;
  readonly createdAt: Date;
}
