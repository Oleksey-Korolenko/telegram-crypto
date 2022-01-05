import { ObjectId } from 'mongodb';

export interface ICryptocurrency extends ICryptocurrencyWithoutId {
  _id: ObjectId;
}

export interface ICryptocurrencyWithoutId {
  id_in_coin_market_cap: number;
}
