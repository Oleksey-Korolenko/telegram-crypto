export interface ICryptocurrencyAPIQueryHeaders {
  'X-CMC_PRO_API_KEY': string;
  'Content-Type': string;
}

export interface ICryptocurrencyAPIQueryResponseStatus {
  error_code: number;
  error_message: null | string;
}

export interface ICryptocurrencyAPIQueryResponse<T> {
  status: ICryptocurrencyAPIQueryResponseStatus;
  data: T;
}

export interface ICryptocurrencyAPIRequestBody {
  symbol: string;
}
