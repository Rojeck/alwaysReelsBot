import { Injectable } from '@nestjs/common';
import { Chat, MessageFrom } from '../../types/telegram';
import { PrismaService } from '../../services/prisma.service';
import { FilterOptions, SortOrder } from '../../types';
import { getPaginationOptions, getSortOptions } from '../../utils/http';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditEventsService {
  constructor(private prisma: PrismaService) {}

  create(postUrl: string, chat: Chat, user: MessageFrom) {
    const { title, type, id } = chat;

    return this.prisma.auditEvents.create({
      data: {
        postUrl,
        userTag: user.username,
        groupName: title,
        groupType: type,
        groupId: String(id),
      },
    });
  }

  async findAll(
    page: string,
    perPage: string,
    searchBy: string,
    searchValue: string,
    sortField: string,
    sortOrder: SortOrder,
    filterOptions: FilterOptions,
  ) {
    const whereCondition = searchBy
      ? {
          ...filterOptions,
          [searchBy]: {
            contains: searchValue,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : filterOptions;

    const countPromise = this.prisma.auditEvents.count({
      where: whereCondition,
    });
    const dataPromise = this.prisma.auditEvents.findMany({
      where: whereCondition,
      ...getPaginationOptions(page, perPage),
      ...getSortOptions(sortField, sortOrder),
    });

    const [data, total] = await Promise.all([dataPromise, countPromise]);

    return { data, total };
  }

  remove(id: number) {
    return this.prisma.auditEvents.delete({
      where: {
        id,
      },
    });
  }
}
