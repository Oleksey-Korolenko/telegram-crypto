import { ObjectId } from 'mongodb';
import { IUserWithoutId, User } from '.';
import { collections } from '../db';

export default class UserQueryService {
  #collection;

  constructor() {
    this.#collection = collections.users;
  }

  public findOne = async (id: number): Promise<User | null> => {
    return this.#collection?.findOne({
      user_tg_id: id,
    }) as Promise<User | null>;
  };

  public findById = async (id: ObjectId): Promise<User | null> => {
    return this.#collection?.findOne({
      _id: id,
    }) as Promise<User | null>;
  };

  public insertOne = async (user: IUserWithoutId): Promise<User | null> => {
    const _id = ObjectId.createFromTime(
      Math.round(new Date().getTime() / 1000)
    );

    const response = await this.#collection?.insertOne({
      ...user,
      _id,
    } as User);

    if (response?.insertedId === undefined) {
      return null;
    }
    return this.findById(response.insertedId);
  };

  public findOneOrInsert = async (
    user: IUserWithoutId
  ): Promise<User | null> => {
    const existUser = await this.findOne(user.user_tg_id);

    if (existUser === null) {
      return this.insertOne(user);
    }

    return existUser;
  };
}
