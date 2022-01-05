import { ObjectId } from 'mongodb';

export interface IUser extends IUserWithoutId {
  _id: ObjectId;
}

export interface IUserWithoutId {
  user_tg_id: number;
}
