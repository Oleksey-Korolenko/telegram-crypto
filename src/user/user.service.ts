import { ObjectId } from 'mongodb';
import { IUserWithoutId, User } from '.';
import { collections } from '../db';

export default class UserService {
  private _collection;

  constructor() {
    this._collection = collections.users;
  }

  public findOne = async (id: number): Promise<User | null> => {
    return this._collection?.findOne({
      user_tg_id: id,
    }) as Promise<User | null>;
  };

  public findById = async (id: ObjectId): Promise<User | null> => {
    return this._collection?.findOne({
      _id: id,
    }) as Promise<User | null>;
  };

  public insertOne = async (user: IUserWithoutId): Promise<User | null> => {
    const _id = ObjectId.createFromTime(
      Math.round(new Date().getTime() / 1000)
    );

    const response = await this._collection?.insertOne({
      ...user,
      _id,
    } as User);

    if (response?.insertedId === undefined) {
      return null;
    }
    return this.findById(response.insertedId);
  };
}
