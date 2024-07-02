import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Chat, FilterOptions, MessageFrom, SortOrder } from 'src/types';
import { getPaginationOptions, getSortOptions } from 'src/utils';
import { USERS_MODEL } from './users.providers';
import { Users } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_MODEL)
    private users: Model<Users>,
  ) {}

  async findAll() {
    return this.users.find();
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
      this.users.find(query).sort(sortOptions).skip(skip).limit(take).exec(),
      this.users.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  private findOneByUserId(userId: string) {
    return this.users.findOne({ userId }).exec();
  }

  async createOrFindOne(user: MessageFrom) {
    const { username, id: userId } = user;

    const existedUser = await this.findOneByUserId(String(userId));
    if (existedUser) return existedUser;

    const newUser = new this.users({
      userId,
      userTag: username,
    });

    return newUser.save();
  }

  removeByUserId(userId: number) {
    return this.users.findOneAndDelete({ userId });
  }
}
