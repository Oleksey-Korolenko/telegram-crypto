import {
  ITelegramQueryBody,
  ITelegramQueryHeaders,
  ITelegramWebhookResponse,
} from '.';
import CryptoProcessorService from '../crypto-processor/crypto-processor.service';
import { IQueryAttributes } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import messagesInRussian from './messages/ru';

export default class TelegramService {
  private _baseUrl;

  private _token;

  private _baseHeaders;

  private _baseAttributes;

  private _queryService;

  private _cryptoProcessorService;

  constructor() {
    this._baseUrl = process.env.TELEGRAM_WEBHOOK_HOST;
    this._token = process.env.TELEGRAM_ADMIN_TOKEN;
    this._baseHeaders = {
      'Content-Type': 'application/json',
    } as ITelegramQueryHeaders;
    this._baseAttributes = {
      hostname: 'api.telegram.org',
      path: '',
      method: 'GET',
      port: 443,
      headers: {
        ...this._baseHeaders,
      },
    } as IQueryAttributes<ITelegramQueryHeaders>;
    this._queryService = new QueryService();
    this._cryptoProcessorService = new CryptoProcessorService();
  }

  public setWebhook = async () => {
    const response = await this._queryService.sendRequest<
      {},
      ITelegramWebhookResponse,
      {}
    >(
      {
        ...this._baseAttributes,
        path: `/bot${this._token}/setWebhook`,
      },
      {
        url: `${this._baseUrl}/api/telegram/update`,
      },
      {}
    );

    if (response.code !== EQueryCode.OK || response.data?.ok === false) {
      throw new Error(
        `Can't set webhook to telegram! ${response.data?.description ?? ''}`
      );
    } else {
      console.info(response.data?.description);
    }
  };

  private sendMessage = async (chat_id: number | string, text: string) => {
    const response = await this._queryService.sendRequest<
      {},
      ITelegramWebhookResponse,
      ITelegramQueryBody
    >(
      {
        ...this._baseAttributes,
        method: 'POST',
        path: `/bot${this._token}/sendMessage`,
      },
      {},
      {
        chat_id,
        text,
        parse_mode: 'HTML',
      }
    );

    if (response.code !== EQueryCode.OK || response.data?.ok === false) {
      throw new Error(
        `Can't send message to telegram chat: [${chat_id}]! ${
          response.data?.description ?? ''
        }`
      );
    }
  };

  public listRecent = async (chat_id: number | string) => {
    const cryptocurrencies =
      await this._cryptoProcessorService.getListOfCryptocurrencies();

    if (cryptocurrencies.data === undefined) {
      this.sendMessage(chat_id, messagesInRussian.ERROR);
    }

    let preparedText = messagesInRussian.LIST_RECENT.TITLE;
    preparedText += cryptocurrencies.data
      ?.map((it) => `/${it.symbol} ${it.priceInUSD}$`)
      .join('\n');

    await this.sendMessage(chat_id, preparedText);
  };

  public start = async (chat_id: number | string) => {
    const preparedText = `${messagesInRussian.START}`;

    await this.sendMessage(chat_id, preparedText);
  };

  public help = async (chat_id: number | string) => {
    let preparedText = '';

    const help: { [key: string]: string } = messagesInRussian.HELP;

    for (const key in help) {
      if (!help[key]) {
        continue;
      }
      preparedText += help[key];
    }

    await this.sendMessage(chat_id, preparedText);
  };
}
