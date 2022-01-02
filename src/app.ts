import express from 'express';
import requireAll from 'require-all';
import dotenv from 'dotenv';
import { Mongo } from './db';

const bootstrap = async () => {
  const app = express();
  const router = express.Router;

  dotenv.config();

  const mongo = new Mongo();

  const db = await mongo.getConnection();

  await app.use(express.json({ limit: '3mb' }));

  try {
    const controllers = requireAll({
      dirname: __dirname,
      filter: /^.+\.controller\.ts$/,
    });

    for (const name in controllers) {
      app.use(
        `/api/${name}`,
        await controllers[name][`${name}.controller.ts`].default(router, db)
      );

      console.log(`${name} initialized`);
    }
  } catch (e) {
    console.error(e);
  }

  return app;
};

export default bootstrap;
