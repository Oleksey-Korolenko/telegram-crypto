import { Document, ObjectId } from 'mongodb';

export class Cryptocurrency {
  constructor(public id_in_coin_market_cap: number, public _id: ObjectId) {}

  static getSchema(): Document {
    return {
      collMod: process.env.CRYPTOCURRENCY_COLL_NAME,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id_in_coin_market_cap'],
          additionalProperties: false,
          properties: {
            _id: {},
            id_in_coin_market_cap: {
              bsonType: 'int',
              description: "'id_in_coin_market_cap' is required and is a int",
            },
          },
        },
      },
    };
  }
}
