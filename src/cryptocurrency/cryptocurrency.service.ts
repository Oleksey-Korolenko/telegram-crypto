import { ObjectId } from 'mongodb';
import { Cryptocurrency, ICryptocurrencyWithoutId } from '.';
import { collections } from '../db';

export default class CryptocurrencyService {
  private _collection;

  constructor() {
    this._collection = collections.cryptocurrencies;
  }

  public findOne = async (id: number): Promise<Cryptocurrency | null> => {
    return this._collection?.findOne({
      id_in_coin_market_cap: id,
    }) as Promise<Cryptocurrency | null>;
  };

  public findById = async (id: ObjectId): Promise<Cryptocurrency | null> => {
    return this._collection?.findOne({
      _id: id,
    }) as Promise<Cryptocurrency | null>;
  };

  public insertOne = async (
    cryptocurrency: ICryptocurrencyWithoutId
  ): Promise<Cryptocurrency | null> => {
    const _id = ObjectId.createFromTime(
      Math.round(new Date().getTime() / 1000)
    );

    const response = await this._collection?.insertOne({
      ...cryptocurrency,
      _id,
    } as Cryptocurrency);

    if (response?.insertedId === undefined) {
      return null;
    }
    return this.findById(response.insertedId);
  };
}
