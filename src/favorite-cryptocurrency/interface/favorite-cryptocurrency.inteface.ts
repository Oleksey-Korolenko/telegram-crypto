import { ObjectId } from 'mongodb';
import { ICryptocurrency } from '../../cryptocurrency';
import { IUser } from '../../user';

export interface IFavoriteCryptocurrency
  extends IFavoriteCryptocurrencyWithoutId {
  _id: ObjectId;
}

export interface IFavoriteCryptocurrencyWithoutId {
  user: ObjectId;
  cryptocurrency: ObjectId;
}

export interface IFavoriteCryptocurrencyWithRelationships {
  _id: ObjectId;
  user: IUser[];
  cryptocurrency: ICryptocurrency[];
}
