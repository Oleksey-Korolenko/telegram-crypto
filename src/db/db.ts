import mongoose from 'mongoose';

export class Mongo {
  private _dbName;

  private _dbUserLogin;

  private _dbUserPassword;

  private _dbConnectionString;

  constructor() {
    this._dbName = process.env.DB_NAME;
    this._dbUserLogin = process.env.DB_USER_LOGIN;
    this._dbUserPassword = process.env.DB_USER_PASSWORD;
    this._dbConnectionString = `mongodb+srv://${this._dbUserLogin}:${this._dbUserPassword}@cluster0.2n8yr.mongodb.net/${this._dbName}?retryWrites=true&w=majority`;
  }

  public getConnection = async () => {
    return mongoose
      .connect(this._dbConnectionString)
      .then((res) => {
        console.log('Connected to DB');
        return res;
      })
      .catch((error) => console.log(error));
  };
}
