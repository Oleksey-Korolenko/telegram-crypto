import app from './app';

const bootstrap = async () => {
  const server = await app();

  const port = Number(process.env.PORT) ?? 8081;

  server.listen(port, () => {
    console.log(`Started on ${port}`);
  });
};

bootstrap();
