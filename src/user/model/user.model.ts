import { Document, ObjectId } from 'mongodb';

export class User {
  constructor(public user_tg_id: number, public _id: ObjectId) {}

  static getSchema(): Document {
    return {
      collMod: process.env.USER_COLL_NAME,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user_tg_id'],
          additionalProperties: false,
          properties: {
            _id: {},
            user_tg_id: {
              bsonType: 'int',
              description: "'user_tg_id' is required and is a int",
            },
          },
        },
      },
    };
  }
}
