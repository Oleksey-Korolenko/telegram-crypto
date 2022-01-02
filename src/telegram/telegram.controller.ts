import { Request, Response, Router } from 'express';
import { Mongoose } from 'mongoose';
import {
  ITelegramButtonResponse,
  ITelegramCommandRessponse,
  ITelegramUpdateResponse,
} from '.';
import QueryService from '../query/query.service';
import ETelegramButtonType from './enum/button-type.enum';
import ETelegramCommandType from './enum/command-type.enum';
import TelegramService from './telegram.service';

export default async (router: typeof Router, db: Mongoose) => {
  const routes = router();
  const telegramService = new TelegramService();
  await telegramService.setWebhook();
  const queryService = new QueryService();

  routes.post('/update', async (req: Request, res: Response) => {
    const body:
      | ITelegramUpdateResponse
      | ITelegramCommandRessponse
      | ITelegramButtonResponse = req.body;

    if ({}.hasOwnProperty.call(body, 'message')) {
      const checkedBody = body as unknown as
        | ITelegramUpdateResponse
        | ITelegramCommandRessponse;
      if (
        typeof checkedBody.message.text === 'string' &&
        checkedBody.message.text[0] === '/'
      ) {
        switch (checkedBody.message.text) {
          case ETelegramCommandType.START: {
            await telegramService.start(checkedBody.message.chat.id);
            break;
          }
          case ETelegramCommandType.HELP: {
            await telegramService.help(checkedBody.message.chat.id);
            break;
          }
          case ETelegramCommandType.LIST_RECENT: {
            await telegramService.listRecent(checkedBody.message.chat.id);
            break;
          }
          default: {
            await telegramService.defaultComands(checkedBody);
            break;
          }
        }
      }
    } else if ({}.hasOwnProperty.call(body, 'callback_query')) {
      const checkedBody = body as unknown as ITelegramButtonResponse;
      if (typeof checkedBody.callback_query.data === 'string') {
        const operationType = checkedBody.callback_query.data.split(':')[0];
        const item = checkedBody.callback_query.data.split(':')[1];

        switch (operationType) {
          case ETelegramButtonType.REMOVE_FAVORITE: {
            // await telegramService.start(checkedBody.message.chat.id);
            console.log(operationType, 1);
            break;
          }
          case ETelegramButtonType.ADD_FAVORITE: {
            // await telegramService.help(checkedBody.message.chat.id);
            console.log(operationType, 2);
            break;
          }
          default: {
            await telegramService.incorrectCommand(
              checkedBody.callback_query.message.chat.id
            );
            break;
          }
        }
      }
    }

    return queryService.sendAnswer<{}>(200, {}, res);
  });
  return routes;
};
