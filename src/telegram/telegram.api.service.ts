import {
  ITelegramQueryBody,
  ITelegramQueryHeaders,
  ITelegramResponse,
  ITelegramTextFormatterExtra,
  ITelegramUpdateQueryBody,
} from '.';
import { IQueryAttributes } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';

export default class TelegramApiService {
  #baseUrl;
  #token;
  #baseHeaders;
  #baseAttributes;
  #queryService;

  constructor() {
    this.#baseUrl = process.env.TELEGRAM_WEBHOOK_HOST;
    this.#token = process.env.TELEGRAM_ADMIN_TOKEN;
    this.#baseHeaders = {
      'Content-Type': 'application/json',
    } as ITelegramQueryHeaders;
    this.#baseAttributes = {
      hostname: 'api.telegram.org',
      path: '',
      method: 'GET',
      port: 443,
      headers: {
        ...this.#baseHeaders,
      },
    } as IQueryAttributes<ITelegramQueryHeaders>;
    this.#queryService = new QueryService();
  }

  public setWebhook = async () => {
    const response = await this.#queryService.sendRequest<
      {},
      ITelegramResponse,
      {}
    >(
      {
        ...this.#baseAttributes,
        path: `/bot${this.#token}/setWebhook`,
      },
      {
        url: `${this.#baseUrl}/api/telegram/update`,
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

  public sendMessage = async (
    chat_id: number | string,
    text: string,
    extra?: ITelegramTextFormatterExtra
  ) => {
    const response = await this.#queryService.sendRequest<
      {},
      ITelegramResponse,
      ITelegramQueryBody
    >(
      {
        ...this.#baseAttributes,
        method: 'POST',
        path: `/bot${this.#token}/sendMessage`,
      },
      {},
      {
        chat_id,
        text,
        parse_mode: 'HTML',
        ...extra,
      }
    );

    if (response.code !== EQueryCode.OK || response.data?.ok === false) {
      console.warn(
        `Can't send message to telegram chat: [${chat_id}]! ${
          response.data?.description ?? ''
        }`
      );
    }
  };

  public updateMessage = async (
    chat_id: number | string,
    message_id: number,
    text: string,
    extra?: ITelegramTextFormatterExtra
  ) => {
    const response = await this.#queryService.sendRequest<
      {},
      ITelegramResponse,
      ITelegramUpdateQueryBody
    >(
      {
        ...this.#baseAttributes,
        method: 'POST',
        path: `/bot${this.#token}/editMessageText`,
      },
      {},
      {
        chat_id,
        text,
        message_id,
        parse_mode: 'HTML',
        ...extra,
      }
    );

    if (response.code !== EQueryCode.OK || response.data?.ok === false) {
      console.warn(
        `Can't send message to telegram chat: [${chat_id}]! ${
          response.data?.description ?? ''
        }`
      );
    }
  };
}
