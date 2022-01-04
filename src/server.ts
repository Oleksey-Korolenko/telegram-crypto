import app from './app';

const bootstrap = async () => {
  const server = await app();

  const port = process.env.PORT === undefined ? 8081 : +process.env.PORT;

  server.listen(port, () => {
    console.log(`Started on ${port}`);
  });
};

bootstrap();
