import * as mongoose from 'mongoose';
import { VideoService } from 'src/types';

export const AuditEventsSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  downloadedVia: { type: String, required: true },
  service: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface AuditEvents extends Document {
  readonly groupId: string;
  readonly downloadedVia: string;
  readonly service: VideoService;
  readonly createdAt: Date;
}
