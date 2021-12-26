import { IQueryAttributes, IQueryParams, IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import {
  ICryptoProcessorCryptocurrency,
  ICryptoProcessorCryptocurrencySingle,
  ICryptoProcessorPreparedCryptocurrency,
  ICryptoProcessorQueryHeaders,
  ICryptoProcessorQueryResponse,
} from './interface';

export default class CryptoProcessorService {
  private _baseUrl;

  private _apiKey;

  private _baseHeaders;

  private _baseAttributes;

  private _queryService;

  constructor() {
    this._baseUrl = process.env.COIN_MARKET_CAP_BASED_URL;
    this._apiKey = process.env.COIN_MARKET_CAP_API_KEY;
    this._baseHeaders = {
      'X-CMC_PRO_API_KEY': this._apiKey,
      'Content-Type': 'application/json',
    } as ICryptoProcessorQueryHeaders;
    this._baseAttributes = {
      hostname: this._baseUrl ?? '',
      path: '',
      method: 'GET',
      headers: {
        ...this._baseHeaders,
      },
    } as IQueryAttributes<ICryptoProcessorQueryHeaders>;
    this._queryService = new QueryService();
  }

  public getListOfCryptocurrencies = async (): Promise<
    IQueryResponse<ICryptoProcessorPreparedCryptocurrency[]>
  > => {
    const cryptocurrencies = await this._queryService.sendRequest<
      ICryptoProcessorQueryHeaders,
      ICryptoProcessorQueryResponse<ICryptoProcessorCryptocurrency[]>,
      IQueryParams
    >(
      {
        ...this._baseAttributes,
        path: '/v1/cryptocurrency/listings/latest',
        method: 'GET',
      },
      {
        limit: '20',
      },
      {}
    );

    const preparedCryptocurrencies =
      this.preparedResponse<ICryptoProcessorCryptocurrency[]>(cryptocurrencies);

    if (
      preparedCryptocurrencies.code === EQueryCode.OK &&
      preparedCryptocurrencies.data !== undefined
    ) {
      return {
        ...preparedCryptocurrencies,
        data: preparedCryptocurrencies.data?.map(
          (it) =>
            ({
              symbol: it.symbol,
              priceInUSD: it.quote.USD.price,
            } as ICryptoProcessorPreparedCryptocurrency)
        ),
      };
    }

    return {
      ...preparedCryptocurrencies,
      data: undefined,
    };
  };

  public getCryptocurrency = async (
    symbol: string
  ): Promise<IQueryResponse<ICryptoProcessorPreparedCryptocurrency>> => {
    const cryptocurrency = await this._queryService.sendRequest<
      ICryptoProcessorQueryHeaders,
      ICryptoProcessorQueryResponse<ICryptoProcessorCryptocurrencySingle>,
      IQueryParams
    >(
      {
        ...this._baseAttributes,
        path: '/v1/cryptocurrency/quotes/latest',
        method: 'GET',
      },
      {
        symbol,
      },
      {}
    );

    const preparedCryptocurrency =
      this.preparedResponse<ICryptoProcessorCryptocurrencySingle>(
        cryptocurrency
      );

    if (
      preparedCryptocurrency.code === EQueryCode.OK &&
      preparedCryptocurrency.data !== undefined
    ) {
      return {
        ...preparedCryptocurrency,
        data: {
          symbol: preparedCryptocurrency.data[symbol].symbol,
          priceInUSD: preparedCryptocurrency.data[symbol].quote.USD.price,
        } as ICryptoProcessorPreparedCryptocurrency,
      };
    }

    return {
      ...preparedCryptocurrency,
      data: undefined,
    };
  };

  private preparedResponse = <T>(
    response: IQueryResponse<ICryptoProcessorQueryResponse<T>>
  ): IQueryResponse<T> => {
    if (response.code === EQueryCode.OK && response.data !== undefined) {
      const data = response.data;
      if (data.status.error_code === 0) {
        return {
          code: response.code,
          message: response.message,
          data: data.data,
        };
      } else {
        return {
          code: EQueryCode.BAD_REQUEST,
          message:
            data.status.error_message === null
              ? 'Bad request!'
              : data.status.error_message,
        };
      }
    } else {
      return {
        code: response.code,
        message: response.message,
      };
    }
  };
}
