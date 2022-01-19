import { ObjectId } from 'mongodb';
import { FavoriteCryptocurrency, IFavoriteCryptocurrencyWithoutId } from '.';
import { collections } from '../db';

export default class FavoriteCryptocurrencyQueryService {
  #collection;

  constructor() {
    this.#collection = collections.favorite_cryptocurrencies;
  }

  public findOneByUserIdAndCryptocurrencyId = async (
    userId: ObjectId,
    cryptocurrencyId: ObjectId
  ): Promise<FavoriteCryptocurrency | null> => {
    return this.#collection?.findOne({
      $and: [{ user: userId }, { cryptocurrency: cryptocurrencyId }],
    }) as Promise<FavoriteCryptocurrency | null>;
  };

  public findById = async (
    id: ObjectId
  ): Promise<FavoriteCryptocurrency | null> => {
    return this.#collection?.findOne({
      _id: id,
    }) as Promise<FavoriteCryptocurrency | null>;
  };

  public insertOne = async (
    cryptocurrency: IFavoriteCryptocurrencyWithoutId
  ): Promise<FavoriteCryptocurrency | null> => {
    const _id = ObjectId.createFromTime(
      Math.round(new Date().getTime() / 1000)
    );

    const response = await this.#collection?.insertOne({
      ...cryptocurrency,
      _id,
    } as FavoriteCryptocurrency);

    if (response?.insertedId === undefined) {
      return null;
    }
    return this.findById(response.insertedId);
  };

  public deleteOne = async (id: ObjectId): Promise<boolean> => {
    const response = await this.#collection?.deleteOne({ _id: id });

    if (response === undefined) {
      throw new Error(`Bad request! Undefined in response!`);
    }

    if (response.deletedCount === 0) {
      throw new Error(`Bad request! Can't find something to delete!`);
    }

    return true;
  };

  public aggregation = async <T>(
    pipeline: Document[]
  ): Promise<T[] | undefined> => {
    const response = await this.#collection?.aggregate<T>(pipeline);
    if (response === undefined) {
      return response;
    }

    return response.toArray();
  };
}
