import { LoggerService } from '@nestjs/common';

export interface ILogger extends LoggerService {
  setContext(context: string): void;
}

export interface IHttpExceptionResponse {
  statusCode: number;
  error: string;
  message: string | Array<string>;
}

export interface ICustomHttpExceptionResponse extends IHttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}

export type SortOrder = 'asc' | 'desc';

export type PaginationOptions = { skip: number; take: number } | object;

export type SortOptions = { orderBy: { [key: string]: SortOrder } } | object;

export type FilterOptions = { [key: string]: string };

export type QueryOptions = {
  page?: string;
  perPage?: string;
  sortField?: string;
  sortOrder?: SortOrder;
  [key: string]: string;
};
