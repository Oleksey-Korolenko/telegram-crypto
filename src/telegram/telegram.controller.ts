import { Request, Response, Router } from 'express';
import { ITelegramCommandRessponse, ITelegramRessponse } from '.';
import QueryService from '../query/query.service';
import ETelegramCommandType from './enum/command-type.enum';
import TelegramService from './telegram.service';

export default async (router: typeof Router) => {
  const routes = router();
  const telegramService = new TelegramService();
  await telegramService.setWebhook();
  const queryService = new QueryService();

  routes.post('/update', async (req: Request, res: Response) => {
    const body: ITelegramRessponse | ITelegramCommandRessponse = req.body;

    if (typeof body.message.text === 'string' && body.message.text[0] === '/') {
      switch (body.message.text) {
        case ETelegramCommandType.START: {
          await telegramService.start(body.message.chat.id);
          break;
        }
        case ETelegramCommandType.HELP: {
          await telegramService.help(body.message.chat.id);
          break;
        }
        case ETelegramCommandType.LIST_RECENT: {
          await telegramService.listRecent(body.message.chat.id);
          break;
        }
        default: {
          await telegramService.defaultComands(body);
          break;
        }
      }
    }

    return queryService.sendAnswer<{}>(200, {}, res);
  });
  return routes;
};
