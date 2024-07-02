import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  createZipBuffer,
  getPaginationOptions,
  getSortOptions,
} from '../../utils';
import {
  Chat,
  FilterOptions,
  InstaDownloaders,
  MessageFrom,
  SortOrder,
  VideoService,
} from '../../types';
import { AUDIT_EVENTS_MODEL } from './audit-events.providers';
import { AuditEvents } from './audit-events.schema';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class AuditEventsService {
  private ownerId: string;
  private auditEventsCleanOn: number;

  constructor(
    @Inject(AUDIT_EVENTS_MODEL)
    private auditEvents: Model<AuditEvents>,
    private messageService: MessagesService,
    private config: ConfigService,
  ) {
    this.ownerId = this.config.get('OWNER_TG_ID');
    this.auditEventsCleanOn = Number(this.config.get('AUDIT_EVENTS_CLEAN_ON'));
  }

  create(
    chat: Chat,
    user: MessageFrom,
    downloadedVia: InstaDownloaders,
    service: VideoService,
  ) {
    const { id } = chat;

    const newAuditEvent = new this.auditEvents({
      groupId: String(id),
      downloadedVia,
      service,
    });

    return newAuditEvent.save();
  }

  async findMany(
    page: string,
    perPage: string,
    searchBy: string,
    searchValue: string,
    sortField: string,
    sortOrder: SortOrder,
    filterOptions: FilterOptions,
  ) {
    const query = searchBy
      ? {
          ...filterOptions,
          [searchBy]: { $regex: searchValue, $options: 'i' },
        }
      : filterOptions;

    const { take, skip } = getPaginationOptions(page, perPage);
    const sortOptions = getSortOptions(sortField, sortOrder);

    const [data, total] = await Promise.all([
      this.auditEvents
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(take)
        .exec(),
      this.auditEvents.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  remove(id: string) {
    return this.auditEvents.findByIdAndDelete(id).exec();
  }

  async processCleanAuditEvents(): Promise<void> {
    const count = await this.auditEvents.countDocuments().exec();

    if (!this.auditEventsCleanOn || count < this.auditEventsCleanOn) {
      return;
    }

    const date = new Date().toISOString();
    const data = await this.auditEvents.find().lean().exec();

    const bufferData = data.map((item) => JSON.stringify(item)).join('\n');
    const buffer = Buffer.from(bufferData, 'utf-8');
    const document = { name: `${date}.txt`, buffer };
    const zip = createZipBuffer([document]);

    await this.messageService.sendFile(this.ownerId, {
      name: 'analytics.zip',
      buffer: zip,
    });

    await this.auditEvents.collection.drop();
  }
}
