import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryOptions } from '../../types';
import { extractSearchOptions } from '../../utils';
import { AuditEventsService } from './audit-events.service';

@UseGuards(AuthGuard('jwt'))
@Controller('audit-events')
export class AuditEventsController {
  constructor(private readonly auditEventsService: AuditEventsService) {}

  @Get()
  findMany(@Query() query: QueryOptions) {
    const { page, perPage, sortField, sortOrder, ...filterOptions } = query;
    const { searchBy, searchValue } = extractSearchOptions(filterOptions);

    return this.auditEventsService.findMany(
      page,
      perPage,
      searchBy,
      searchValue,
      sortField,
      sortOrder,
      filterOptions,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditEventsService.remove(id);
  }
}
