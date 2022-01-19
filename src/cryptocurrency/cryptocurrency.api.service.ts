import {
  ICryptocurrencyAPI,
  ICryptocurrencyAPIQueryHeaders,
  ICryptocurrencyAPIQueryResponse,
  ICryptocurrencyAPISingle,
} from '.';
import { IQueryAttributes, IQueryParams, IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';

export default class CryptocurrencyAPIService {
  #baseUrl;
  #apiKey;
  #baseHeaders;
  #baseAttributes;
  #queryService;

  constructor() {
    this.#baseUrl = process.env.COIN_MARKET_CAP_BASED_URL;
    this.#apiKey = process.env.COIN_MARKET_CAP_API_KEY;
    this.#baseHeaders = {
      'X-CMC_PRO_API_KEY': this.#apiKey,
      'Content-Type': 'application/json',
    } as ICryptocurrencyAPIQueryHeaders;
    this.#baseAttributes = {
      hostname: this.#baseUrl ?? '',
      path: '',
      method: 'GET',
      headers: {
        ...this.#baseHeaders,
      },
    } as IQueryAttributes<ICryptocurrencyAPIQueryHeaders>;
    this.#queryService = new QueryService();
  }

  public getListOfCryptocurrencies = (): Promise<
    IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      EQueryCode
    >
  > => {
    return this.#queryService.sendRequest<
      ICryptocurrencyAPIQueryHeaders,
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      IQueryParams
    >(
      {
        ...this.#baseAttributes,
        path: '/v1/cryptocurrency/listings/latest',
        method: 'GET',
      },
      {
        limit: '20',
      },
      {}
    );
  };

  public getListOfFavoriteCryptocurrencies = (
    listOfIds: number[]
  ): Promise<
    IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      EQueryCode
    >
  > => {
    return this.#queryService.sendRequest<
      ICryptocurrencyAPIQueryHeaders,
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      IQueryParams
    >(
      {
        ...this.#baseAttributes,
        path: '/v1/cryptocurrency/quotes/latest',
        method: 'GET',
      },
      {
        id: listOfIds.join(','),
      },
      {}
    );
  };

  public getCryptocurrency = (
    symbol: string
  ): Promise<
    IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPISingle>,
      EQueryCode
    >
  > => {
    return this.#queryService.sendRequest<
      ICryptocurrencyAPIQueryHeaders,
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPISingle>,
      IQueryParams
    >(
      {
        ...this.#baseAttributes,
        path: '/v1/cryptocurrency/quotes/latest',
        method: 'GET',
      },
      {
        symbol,
      },
      {}
    );
  };
}
