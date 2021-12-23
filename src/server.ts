import app from './app';

const bootstrap = async () => {
  const server = await app();

  const port = Number(process.env.PORT) ?? 8081;
  const host = process.env.HOST ?? 'localhost';

  server.listen(port, host, () => {
    console.log(`Started on http://${host}:${port}`);
  });
};

bootstrap();
