import {
  ICryptocurrencyAPI,
  ICryptocurrencyAPIPrepared,
  ICryptocurrencyAPIQueryResponse,
  ICryptocurrencyAPISingle,
} from '.';
import { IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import ECryptocurrencyAPICode from './enum/cryptocurrency-api-code.enum';

export default class CryptocurrencyView {
  static getListOfCryptocurrencies = (
    cryptocurrencies: IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      EQueryCode
    >
  ): IQueryResponse<ICryptocurrencyAPIPrepared[], EQueryCode> => {
    const preparedCryptocurrencies =
      this.preparedResponse<ICryptocurrencyAPI[]>(cryptocurrencies);

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
            } as ICryptocurrencyAPIPrepared)
        ),
      };
    }

    return {
      ...preparedCryptocurrencies,
      data: undefined,
    };
  };

  static getListOfFavoriteCryptocurrencies = (
    cryptocurrencies: IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPI[]>,
      EQueryCode
    >
  ): IQueryResponse<ICryptocurrencyAPIPrepared[], EQueryCode> => {
    const preparedCryptocurrencies =
      this.preparedResponse<ICryptocurrencyAPI[]>(cryptocurrencies);

    if (
      preparedCryptocurrencies.code === EQueryCode.OK &&
      preparedCryptocurrencies.data !== undefined
    ) {
      const data: ICryptocurrencyAPIPrepared[] = [];

      for (const key in preparedCryptocurrencies.data) {
        if (!preparedCryptocurrencies.data[key]) {
          continue;
        }

        data.push({
          symbol: preparedCryptocurrencies.data[key].symbol,
          priceInUSD: preparedCryptocurrencies.data[key].quote.USD.price,
        });
      }

      return {
        ...preparedCryptocurrencies,
        data,
      };
    }

    return {
      ...preparedCryptocurrencies,
      data: undefined,
    };
  };

  static getCryptocurrency = (
    cryptocurrency: IQueryResponse<
      ICryptocurrencyAPIQueryResponse<ICryptocurrencyAPISingle>,
      EQueryCode
    >,
    symbol: string
  ): IQueryResponse<ICryptocurrencyAPISingle, ECryptocurrencyAPICode> => {
    if (
      cryptocurrency.code !== EQueryCode.OK ||
      cryptocurrency.data === undefined
    ) {
      return {
        ...cryptocurrency,
        code: ECryptocurrencyAPICode.BAD_REQUEST,
        data: undefined,
      };
    }

    if (
      cryptocurrency.data.status.error_code === 400 &&
      cryptocurrency.data.status.error_message ===
        `Invalid value for \"symbol\": \"${symbol}\"`
    ) {
      return {
        ...cryptocurrency,
        code: ECryptocurrencyAPICode.INVALID_SYMBOL,
        data: undefined,
      };
    } else if (cryptocurrency.data.status.error_code !== 0) {
      return {
        ...cryptocurrency,
        code: ECryptocurrencyAPICode.BAD_REQUEST,
        data: undefined,
      };
    }

    return {
      code: ECryptocurrencyAPICode.OK,
      message: cryptocurrency.message,
      data: cryptocurrency.data.data,
    };
  };

  static preparedResponse = <T>(
    response: IQueryResponse<ICryptocurrencyAPIQueryResponse<T>, EQueryCode>
  ): IQueryResponse<T, EQueryCode> => {
    if (response.code !== EQueryCode.OK || response.data === undefined) {
      return {
        code: response.code,
        message: response.message,
      };
    }

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
  };
}
