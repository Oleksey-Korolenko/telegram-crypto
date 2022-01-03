import { Types } from 'mongoose';
import { ITelegramCryptocurrency, ITelegramUser } from '.';

export interface ITelegramFavoriteCryptocurrency {
  coin_market_cap: Types.ObjectId;
  user: Types.ObjectId;
}

export interface ITelegramFavoriteCryptocurrencyRelations {
  coin_market_cap: ITelegramCryptocurrency[];
  user: ITelegramUser[];
}
