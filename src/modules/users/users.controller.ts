import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryOptions } from 'src/types';
import { extractSearchOptions } from 'src/utils';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryOptions) {
    const { page, perPage, sortField, sortOrder, ...filterOptions } = query;
    const { searchBy, searchValue } = extractSearchOptions(filterOptions);

    return this.usersService.findMany(
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
