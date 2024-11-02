import * as mongoose from 'mongoose';
import { VideoService } from 'src/types';

export const GroupsSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupName: { type: String, required: true },
  addedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  disabledServices: {
    [VideoService.TT]: { type: Boolean, default: false },
    [VideoService.YT]: { type: Boolean, default: false },
    [VideoService.IG]: { type: Boolean, default: false },
  },
});

export interface Groups extends Document {
  readonly groupId: string;
  readonly groupName: string;
  readonly addedBy: string;
  readonly createdAt: Date;
  readonly disabledServices: {
    [VideoService.TT]: boolean;
    [VideoService.YT]: boolean;
    [VideoService.IG]: boolean;
  };
}
