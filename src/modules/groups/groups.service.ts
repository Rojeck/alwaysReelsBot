import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  FilterOptions,
  SortOrder,
  Chat,
  MessageFrom,
  VideoService,
} from 'src/types';
import { getPaginationOptions, getSortOptions } from 'src/utils';
import { GROUPS_MODEL } from './groups.providers';
import { Groups } from './groups.schema';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GROUPS_MODEL)
    private groups: Model<Groups>,
  ) {}

  async findAll() {
    return this.groups.find();
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
      this.groups.find(query).sort(sortOptions).skip(skip).limit(take).exec(),
      this.groups.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOneByGroupId(groupId: string) {
    return this.groups.findOne({ groupId }).exec();
  }

  async createOrFindOne(chat: Chat, user: MessageFrom) {
    const { id, title } = chat;
    const { username } = user;

    const existedGroup = await this.findOneByGroupId(String(id));
    if (existedGroup) return existedGroup;

    const newGroup = new this.groups({
      groupId: String(id),
      groupName: title,
      addedBy: username,
    });

    return newGroup.save();
  }

  removeByGroupId(groupId: number) {
    return this.groups.findOneAndDelete({ groupId });
  }

  async toggleService(groupId: string, service: VideoService) {
    const group = await this.findOneByGroupId(groupId);

    group.disabledServices[service] = !group.disabledServices[service];
    return group.save();
  }
}
