import { IQueryAttributes, IQueryParams, IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import ECryptoProcessorCode from './enum/crypto-processor-code.enum';
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
    IQueryResponse<ICryptoProcessorPreparedCryptocurrency[], EQueryCode>
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
  ): Promise<
    IQueryResponse<ICryptoProcessorCryptocurrencySingle, ECryptoProcessorCode>
  > => {
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

    if (
      cryptocurrency.code === EQueryCode.OK &&
      cryptocurrency.data !== undefined
    ) {
      if (cryptocurrency.data.status.error_code !== 0) {
        if (
          cryptocurrency.data.status.error_code === 400 &&
          cryptocurrency.data.status.error_message ===
            `Invalid value for \"symbol\": \"${symbol}\"`
        ) {
          return {
            ...cryptocurrency,
            code: ECryptoProcessorCode.INVALID_SYMBOL,
            data: undefined,
          };
        }
        return {
          ...cryptocurrency,
          code: ECryptoProcessorCode.BAD_REQUEST,
          data: undefined,
        };
      }
      return {
        code: ECryptoProcessorCode.OK,
        message: cryptocurrency.message,
        data: cryptocurrency.data.data,
      };
    }

    return {
      ...cryptocurrency,
      code: ECryptoProcessorCode.BAD_REQUEST,
      data: undefined,
    };
  };

  private preparedResponse = <T>(
    response: IQueryResponse<ICryptoProcessorQueryResponse<T>, EQueryCode>
  ): IQueryResponse<T, EQueryCode> => {
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
