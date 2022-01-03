import mongoose from 'mongoose';
import { ITelegramUser } from '..';

const userSchema = new mongoose.Schema<ITelegramUser>({
  user_tg_id: {
    type: Number,
    required: true,
  },
});

export const User = mongoose.model('users', userSchema);
