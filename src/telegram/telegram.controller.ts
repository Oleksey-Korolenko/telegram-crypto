import { Request, Response, Router } from 'express';
import QueryService from '../query/query.service';
import TelegramService from './telegram.service';

export default async (router: typeof Router) => {
  const routes = router();
  const telegramService = new TelegramService();
  await telegramService.setWebhook();
  const queryService = new QueryService();

  routes.post('/update', async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.body.message.from);
    console.log(req.body.message.chat);
    console.log(req.body.message.entities);

    return queryService.sendAnswer<{}>(200, {}, res);
  });

  return routes;
};
