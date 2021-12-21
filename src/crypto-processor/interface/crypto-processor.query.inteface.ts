export interface ICryptoProcessorQueryHeaders {
  'X-CMC_PRO_API_KEY': string;
  'Content-Type': string;
}

export interface ICryptoProcessorQueryResponseStatus {
  error_code: number;
  error_message: null | string;
}

export interface ICryptoProcessorQueryResponse<T> {
  status: ICryptoProcessorQueryResponseStatus;
  data: T;
}
