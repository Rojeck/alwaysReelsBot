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
