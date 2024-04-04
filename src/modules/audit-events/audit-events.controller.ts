import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditEventsService } from './audit-events.service';
import { QueryOptions } from '../../types';
import { extractSearchOptions } from '../../utils/http';
import { AuthGuard } from '@nestjs/passport';

@Controller('audit-events')
export class AuditEventsController {
  constructor(private readonly auditEventsService: AuditEventsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: QueryOptions) {
    const { page, perPage, sortField, sortOrder, ...filterOptions } = query;
    const { searchBy, searchValue } = extractSearchOptions(filterOptions);

    return this.auditEventsService.findAll(
      page,
      perPage,
      searchBy,
      searchValue,
      sortField,
      sortOrder,
      filterOptions,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditEventsService.remove(+id);
  }
}
