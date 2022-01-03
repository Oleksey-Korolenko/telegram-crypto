import mongoose from 'mongoose';
import { ITelegramCryptocurrency } from '..';

const сryptocurrencySchema = new mongoose.Schema<ITelegramCryptocurrency>({
  id_in_coin_market_cap: {
    type: Number,
    required: true,
  },
});

export const Cryptocurrency = mongoose.model(
  'cryptocurrencies',
  сryptocurrencySchema
);
