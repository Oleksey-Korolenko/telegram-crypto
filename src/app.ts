import express from 'express';
import requireAll from 'require-all';
import dotenv from 'dotenv';

const bootstrap = async () => {
  const app = express();
  const router = express.Router;

  dotenv.config();

  app.use(express.json({ limit: '3mb' }));

  try {
    const controllers = requireAll({
      dirname: __dirname,
      filter: /^.+\.controller\.ts$/,
    });

    for (const name in controllers) {
      app.use(
        `/api/${name}`,
        await controllers[name][`${name}.controller.ts`].default(router)
      );

      console.log(`${name} initialized`);
    }
  } catch (e) {
    console.error(e);
  }

  return app;
};

export default bootstrap;
