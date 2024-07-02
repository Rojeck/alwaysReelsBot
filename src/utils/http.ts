import { PaginationOptions, QueryOptions, SortOrder } from '../types';

export function getPaginationOptions(
  page = '1',
  perPage = '300',
): PaginationOptions {
  return { take: +perPage, skip: (+page - 1) * +perPage };
}

export function getSortOptions(
  sortField = 'createdAt',
  sortOrder: SortOrder,
): { [key: string]: 1 | -1 } {
  const sortDirection = sortOrder === SortOrder.ASC ? 1 : -1;
  return { [sortField]: sortDirection };
}

export function extractSearchOptions(query: QueryOptions) {
  const searchBy = Object.keys(query)
    .find((key) => key.startsWith('$'))
    ?.slice(1);
  const searchValue = query[`$${searchBy}`];

  if (searchBy) {
    delete query[`$${searchBy}`];
  }

  return { searchBy, searchValue };
}
