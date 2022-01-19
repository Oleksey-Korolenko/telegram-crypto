import { ObjectId } from 'mongodb';
import { IUserWithoutId, User } from '.';
import UserQueryService from './user.query.service';

export default class UserService {
  #userQueryService;

  constructor() {
    this.#userQueryService = new UserQueryService();
  }

  public findOne = (id: number): Promise<User | null> => {
    return this.#userQueryService.findOne(id);
  };

  public findById = (id: ObjectId): Promise<User | null> => {
    return this.#userQueryService.findById(id);
  };

  public insertOne = (user: IUserWithoutId): Promise<User | null> => {
    return this.#userQueryService.insertOne(user);
  };

  public findOneOrInsert = (user: IUserWithoutId): Promise<User | null> => {
    return this.#userQueryService.findOneOrInsert(user);
  };
}
