import { ObjectId } from 'mongodb';
import { FavoriteCryptocurrency, IFavoriteCryptocurrencyWithoutId } from '.';
import FavoriteCryptocurrencyQueryService from './favorite-cryptocurrency.query.service';

export default class FavoriteCryptocurrencyService {
  #favoriteCryptocurrencyQueryService;

  constructor() {
    this.#favoriteCryptocurrencyQueryService =
      new FavoriteCryptocurrencyQueryService();
  }

  public findOneByUserIdAndCryptocurrencyId = (
    userId: ObjectId,
    cryptocurrencyId: ObjectId
  ): Promise<FavoriteCryptocurrency | null> => {
    return this.#favoriteCryptocurrencyQueryService.findOneByUserIdAndCryptocurrencyId(
      userId,
      cryptocurrencyId
    );
  };

  public findById = async (
    id: ObjectId
  ): Promise<FavoriteCryptocurrency | null> => {
    return this.#favoriteCryptocurrencyQueryService.findById(id);
  };

  public insertOne = async (
    cryptocurrency: IFavoriteCryptocurrencyWithoutId
  ): Promise<FavoriteCryptocurrency | null> => {
    return this.#favoriteCryptocurrencyQueryService.insertOne(cryptocurrency);
  };

  public deleteOne = async (id: ObjectId): Promise<boolean> => {
    return this.#favoriteCryptocurrencyQueryService.deleteOne(id);
  };

  public aggregation = async <T>(
    pipeline: Document[]
  ): Promise<T[] | undefined> => {
    return this.#favoriteCryptocurrencyQueryService.aggregation(pipeline);
  };
}
