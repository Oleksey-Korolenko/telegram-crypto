import { Request, Response, Router } from 'express';
import {
  ITelegramButtonResponse,
  ITelegramCommandRessponse,
  ITelegramUpdateResponse,
} from '.';
import QueryService from '../query/query.service';
import ETelegramButtonType from './enum/button-type.enum';
import ETelegramCommandType from './enum/command-type.enum';
import TelegramService from './telegram.service';

export default async (router: typeof Router) => {
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
        switch (checkedBody.message.text.split('@')[0]) {
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
          case ETelegramCommandType.LIST_FAVORITE: {
            await telegramService.listFavorite(
              checkedBody.message.chat.id,
              checkedBody.message.from.id
            );
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

      if (typeof checkedBody.callback_query.data !== 'string') {
        return queryService.sendAnswer<{}>(200, {}, res);
      }

      const operationType = checkedBody.callback_query.data.split(':')[0];
      const item = checkedBody.callback_query.data.split(':')[1];

      switch (operationType) {
        case ETelegramButtonType.REMOVE_FAVORITE: {
          const cryptocurrencyId = item.split(',')[0];
          const symbol = item.split(',')[1];
          await telegramService.removeFromFavoriteCryptocurrency(
            checkedBody.callback_query.message.chat.id,
            checkedBody.callback_query.message.message_id,
            cryptocurrencyId,
            symbol
          );
          break;
        }
        case ETelegramButtonType.ADD_FAVORITE: {
          const cryptocurrencyId = item.split(',')[0];
          const symbol = item.split(',')[1];
          await telegramService.saveFavoriteCryptocurrency(
            checkedBody.callback_query.message.chat.id,
            checkedBody.callback_query.message.message_id,
            checkedBody.callback_query.from.id,
            Number(cryptocurrencyId),
            symbol
          );
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

    return queryService.sendAnswer<{}>(200, {}, res);
  });
  return routes;
};
