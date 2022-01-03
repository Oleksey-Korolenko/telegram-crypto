import mongoose from 'mongoose';
import { ITelegramFavoriteCryptocurrency } from '..';

const favoriteCryptocurrencySchema =
  new mongoose.Schema<ITelegramFavoriteCryptocurrency>({
    id_in_coin_market_cap: {
      type: Number,
      required: true,
    },
    user_tg_id: {
      type: Number,
      required: true,
    },
  });

export const FavoriteCryptocurrency = mongoose.model(
  'favorite_cryptocurrency',
  favoriteCryptocurrencySchema
);
