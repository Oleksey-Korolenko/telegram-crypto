import EQueryCode from '../enum/query.enum';

export interface IQueryAttributes<T> {
  hostname: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  headers: T;
}

export interface IQueryParams {
  [key: string]: string;
}

export interface IQueryResponse<T> {
  message: string;
  code: EQueryCode;
  data?: T;
}
