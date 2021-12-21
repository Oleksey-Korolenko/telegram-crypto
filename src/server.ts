import app from './app';

const port = process.env.PORT || 3550;

app.listen(port, () => {
  console.log(`Сервер запущен на порте ${port}`);
});
