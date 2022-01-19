import { ObjectId } from 'mongodb';
import {
  Cryptocurrency,
  ICryptocurrencyAPIPrepared,
  ICryptocurrencyAPISingle,
  ICryptocurrencyWithoutId,
} from '.';
import { IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import CryptocurrencyAPIService from './cryptocurrency.api.service';
import CryptocurrencyQueryService from './cryptocurrency.query.service';
import CryptocurrencyView from './cryptocurrency.view';
import ECryptocurrencyAPICode from './enum/cryptocurrency-api-code.enum';

export default class CryptocurrencyService {
  #cryptocurrencyAPIService;
  #cryptocurrencyView;
  #cryptocurrencyQueryService;

  constructor() {
    this.#cryptocurrencyAPIService = new CryptocurrencyAPIService();
    this.#cryptocurrencyView = CryptocurrencyView;
    this.#cryptocurrencyQueryService = new CryptocurrencyQueryService();
  }

  public getListOfCryptocurrencies = async (): Promise<
    IQueryResponse<ICryptocurrencyAPIPrepared[], EQueryCode>
  > => {
    const cryptocurrencies =
      await this.#cryptocurrencyAPIService.getListOfCryptocurrencies();

    return this.#cryptocurrencyView.getListOfCryptocurrencies(cryptocurrencies);
  };

  public getListOfFavoriteCryptocurrencies = async (
    listOfIds: number[]
  ): Promise<IQueryResponse<ICryptocurrencyAPIPrepared[], EQueryCode>> => {
    const cryptocurrencies =
      await this.#cryptocurrencyAPIService.getListOfFavoriteCryptocurrencies(
        listOfIds
      );

    return this.#cryptocurrencyView.getListOfFavoriteCryptocurrencies(
      cryptocurrencies
    );
  };

  public getCryptocurrency = async (
    symbol: string
  ): Promise<
    IQueryResponse<ICryptocurrencyAPISingle, ECryptocurrencyAPICode>
  > => {
    const cryptocurrency =
      await this.#cryptocurrencyAPIService.getCryptocurrency(symbol);

    return this.#cryptocurrencyView.getCryptocurrency(cryptocurrency, symbol);
  };

  public findOne = (id: number): Promise<Cryptocurrency | null> => {
    return this.#cryptocurrencyQueryService.findOne(id);
  };

  public findById = async (id: ObjectId): Promise<Cryptocurrency | null> => {
    return this.#cryptocurrencyQueryService.findById(id);
  };

  public insertOne = async (
    cryptocurrency: ICryptocurrencyWithoutId
  ): Promise<Cryptocurrency | null> => {
    return this.#cryptocurrencyQueryService.insertOne(cryptocurrency);
  };

  public findOneOrInsert = async (
    cryptocurrency: ICryptocurrencyWithoutId
  ): Promise<Cryptocurrency | null> => {
    return this.#cryptocurrencyQueryService.findOneOrInsert(cryptocurrency);
  };
}
