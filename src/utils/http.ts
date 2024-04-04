import {
  PaginationOptions,
  QueryOptions,
  SortOptions,
  SortOrder,
} from '../types';

export const getPaginationOptions = (
  page = '1',
  perPage = '300',
): PaginationOptions => {
  return { take: +perPage, skip: (+page - 1) * +perPage };
};

export const getSortOptions = (
  field: string,
  order: SortOrder,
): SortOptions => {
  if (!(field || order)) {
    return {};
  }

  return { orderBy: { [field]: order } };
};

export const extractSearchOptions = (query: QueryOptions) => {
  const searchBy = Object.keys(query)
    .find((key) => key.startsWith('$'))
    ?.slice(1);
  const searchValue = query[`$${searchBy}`];

  if (searchBy) {
    delete query[`$${searchBy}`];
  }

  return { searchBy, searchValue };
};
