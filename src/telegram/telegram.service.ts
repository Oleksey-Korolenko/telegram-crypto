import {
  IArgsForPreparedText,
  ITelegramCommandRessponse,
  ITelegramQueryBody,
  ITelegramQueryHeaders,
  ITelegramRessponse,
  ITelegramWebhookResponse,
} from '.';
import CryptoProcessorService from '../crypto-processor/crypto-processor.service';
import ECryptoProcessorCode from '../crypto-processor/enum/crypto-processor-code.enum';
import { ICryptoProcessorCryptocurrencySingle } from '../crypto-processor/interface';
import { IQueryAttributes, IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import messagesInRussian from './messages/ru';
import TelegramTextFormattedService from './telegram-text-formatted.service';

export default class TelegramService {
  private _baseUrl;

  private _token;

  private _baseHeaders;

  private _baseAttributes;

  private _queryService;

  private _cryptoProcessorService;

  private _telegramTextFormattedService;

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
    this._telegramTextFormattedService = new TelegramTextFormattedService();
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

  public defaultComands = async (
    body: ITelegramRessponse | ITelegramCommandRessponse
  ) => {
    const text = body.message.text;
    const chatId = body.message.chat.id;

    if (text[0] !== '/') {
      await this.incorrectCommand(chatId);
      return;
    }

    if (text === text.toUpperCase() && text.length < 10) {
      await this.getCurrencySymbol(chatId, text.split('/')[1]);
      return;
    }

    await this.incorrectCommand(body.message.chat.id);
  };

  public listRecent = async (chat_id: number | string) => {
    const cryptocurrencies =
      await this._cryptoProcessorService.getListOfCryptocurrencies();

    const text =
      this._telegramTextFormattedService.listRecentText(cryptocurrencies);

    await this.sendMessage(chat_id, text);
  };

  public start = async (chat_id: number | string) => {
    const text = this._telegramTextFormattedService.startText();

    await this.sendMessage(chat_id, text);
  };

  public help = async (chat_id: number | string) => {
    const text = this._telegramTextFormattedService.helpText();

    await this.sendMessage(chat_id, text);
  };

  private incorrectCommand = async (chat_id: number | string) => {
    const text = this._telegramTextFormattedService.incorrectCommandText();

    await this.sendMessage(chat_id, text);
  };

  private getCurrencySymbol = async (
    chat_id: number | string,
    symbol: string
  ) => {
    const cryptocurrency = await this._cryptoProcessorService.getCryptocurrency(
      symbol
    );

    const text = this._telegramTextFormattedService.getCurrencySymbolText(
      cryptocurrency,
      symbol
    );

    await this.sendMessage(chat_id, text);
  };
}
