import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryOptions } from 'src/types';
import { extractSearchOptions } from 'src/utils';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findMany(@Query() query: QueryOptions) {
    const { page, perPage, sortField, sortOrder, ...filterOptions } = query;
    const { searchBy, searchValue } = extractSearchOptions(filterOptions);

    return this.groupsService.findMany(
      page,
      perPage,
      searchBy,
      searchValue,
      sortField,
      sortOrder,
      filterOptions,
    );
  }
}
