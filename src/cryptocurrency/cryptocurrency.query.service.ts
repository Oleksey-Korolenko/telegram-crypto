import { ObjectId } from 'mongodb';
import { Cryptocurrency, ICryptocurrencyWithoutId } from '.';
import { collections } from '../db';

export default class CryptocurrencyQueryService {
  #collection;

  constructor() {
    this.#collection = collections.cryptocurrencies;
  }

  public findOne = async (id: number): Promise<Cryptocurrency | null> => {
    return this.#collection?.findOne({
      id_in_coin_market_cap: id,
    }) as Promise<Cryptocurrency | null>;
  };

  public findById = async (id: ObjectId): Promise<Cryptocurrency | null> => {
    return this.#collection?.findOne({
      _id: id,
    }) as Promise<Cryptocurrency | null>;
  };

  public insertOne = async (
    cryptocurrency: ICryptocurrencyWithoutId
  ): Promise<Cryptocurrency | null> => {
    const _id = ObjectId.createFromTime(
      Math.round(new Date().getTime() / 1000)
    );

    const response = await this.#collection?.insertOne({
      ...cryptocurrency,
      _id,
    } as Cryptocurrency);

    if (response?.insertedId === undefined) {
      return null;
    }
    return this.findById(response.insertedId);
  };

  public findOneOrInsert = async (
    cryptocurrency: ICryptocurrencyWithoutId
  ): Promise<Cryptocurrency | null> => {
    const existCryptocurrency = await this.findOne(
      cryptocurrency.id_in_coin_market_cap
    );

    if (existCryptocurrency === null) {
      return this.insertOne(cryptocurrency);
    }

    return existCryptocurrency;
  };
}
