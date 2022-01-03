import mongoose from 'mongoose';
import { ITelegramFavoriteCryptocurrency } from '..';

const favoriteCryptocurrencySchema =
  new mongoose.Schema<ITelegramFavoriteCryptocurrency>({
    coin_market_cap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cryptocurrencies',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  });

export const FavoriteCryptocurrency = mongoose.model(
  'favorite_cryptocurrencies',
  favoriteCryptocurrencySchema
);
