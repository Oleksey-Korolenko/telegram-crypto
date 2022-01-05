import { Document, ObjectId } from 'mongodb';

export class FavoriteCryptocurrency {
  constructor(
    public user: ObjectId,
    public cryptocurrency: ObjectId,
    public _id: ObjectId
  ) {}

  static getSchema(): Document {
    return {
      collMod: process.env.FAVORITE_CRYPTOCURRENCY_COLL_NAME,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user', 'cryptocurrency'],
          additionalProperties: false,
          properties: {
            _id: {},
            user: {
              bsonType: 'objectId',
              description: "'user' is required and is a objectId",
            },
            cryptocurrency: {
              bsonType: 'objectId',
              description: "'cryptocurrency' is required and is a objectId",
            },
          },
        },
      },
    };
  }
}
