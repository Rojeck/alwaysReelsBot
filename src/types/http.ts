export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export type PaginationOptions = { skip: number; take: number };

export type SortOptions = { orderBy: { [key: string]: SortOrder } } | object;

export type FilterOptions = { [key: string]: string };

export type QueryOptions = {
  page?: string;
  perPage?: string;
  sortField?: string;
  sortOrder?: SortOrder;
  [key: string]: string;
};
