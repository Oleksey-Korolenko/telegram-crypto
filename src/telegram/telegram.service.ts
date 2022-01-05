import { ObjectId } from 'mongodb';
import {
  ITelegramCommandRessponse,
  ITelegramQueryBody,
  ITelegramQueryHeaders,
  ITelegramResponse,
  ITelegramTextFormatterExtra,
  ITelegramUpdateQueryBody,
  ITelegramUpdateResponse,
} from '.';
import CryptoProcessorService from '../crypto-processor/crypto-processor.service';
import CryptocurrencyService from '../cryptocurrency/cryptocurrency.service';
import { IFavoriteCryptocurrencyWithRelationships } from '../favorite-cryptocurrency';
import FavoriteCryptocurrencyService from '../favorite-cryptocurrency/favorite-cryptocurrency.service';
import { IQueryAttributes } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import UserService from '../user/user.service';
import ETelegramButtonType from './enum/button-type.enum';
import ETelegramCommandType from './enum/command-type.enum';
import TelegramTextFormattedService from './telegram-text-formatted.service';

export default class TelegramService {
  private _baseUrl;

  private _token;

  private _baseHeaders;

  private _baseAttributes;

  private _queryService;

  private _cryptoProcessorService;

  private _telegramTextFormattedService;

  private _userService;

  private _cryptocurrencyService;

  private _favoriteCryptocurrencyService;

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
    this._userService = new UserService();
    this._cryptocurrencyService = new CryptocurrencyService();
    this._favoriteCryptocurrencyService = new FavoriteCryptocurrencyService();
  }

  public setWebhook = async () => {
    const response = await this._queryService.sendRequest<
      {},
      ITelegramResponse,
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

  private sendMessage = async (
    chat_id: number | string,
    text: string,
    extra?: ITelegramTextFormatterExtra
  ) => {
    const response = await this._queryService.sendRequest<
      {},
      ITelegramResponse,
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

  private updateMessage = async (
    chat_id: number | string,
    message_id: number,
    text: string,
    extra?: ITelegramTextFormatterExtra
  ) => {
    const response = await this._queryService.sendRequest<
      {},
      ITelegramResponse,
      ITelegramUpdateQueryBody
    >(
      {
        ...this._baseAttributes,
        method: 'POST',
        path: `/bot${this._token}/editMessageText`,
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

  public defaultComands = async (
    body: ITelegramUpdateResponse | ITelegramCommandRessponse
  ) => {
    const text = body.message.text.split('@')[0];
    const chatId = body.message.chat.id;

    if (text[0] !== '/') {
      await this.incorrectCommand(chatId);
      return;
    }

    if (text === text.toUpperCase() && text.length < 10) {
      await this.getCurrencySymbol(
        chatId,
        body.message.from.id,
        text.split('/')[1]
      );
      return;
    }

    switch (text.split(' ')[0]) {
      case ETelegramCommandType.ADD_TO_FAVORITE: {
        if (
          text.split(' ')[1] === text.split(' ')[1].toUpperCase() &&
          text.split(' ')[1].length < 10
        ) {
          await this.saveFavoriteCryptocurrencyCommand(
            body.message.chat.id,
            body.message.message_id,
            body.message.from.id,
            text.split(' ')[1]
          );
        }
        return;
      }
      case ETelegramCommandType.DELETE_FAVORITE: {
        if (
          text.split(' ')[1] === text.split(' ')[1].toUpperCase() &&
          text.split(' ')[1].length < 10
        ) {
          await this.removeFromFavoriteCryptocurrencyCommand(
            body.message.chat.id,
            body.message.message_id,
            body.message.from.id,
            text.split(' ')[1]
          );
        }
        return;
      }
    }

    await this.incorrectCommand(chatId);
  };

  public listRecent = async (chat_id: number | string) => {
    const cryptocurrencies =
      await this._cryptoProcessorService.getListOfCryptocurrencies();

    const text = this._telegramTextFormattedService.listRecentText(
      false,
      false,
      cryptocurrencies
    );

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

  public incorrectCommand = async (chat_id: number | string) => {
    const text = this._telegramTextFormattedService.incorrectCommandText();

    await this.sendMessage(chat_id, text);
  };

  public badRequest = async (chat_id: number | string) => {
    const text = this._telegramTextFormattedService.badRequestText();

    await this.sendMessage(chat_id, text);
  };

  private getCurrencySymbol = async (
    chat_id: number | string,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this._cryptoProcessorService.getCryptocurrency(
      symbol
    );

    if (cryptocurrency.data === undefined) {
      const { text, extra } =
        this._telegramTextFormattedService.getCurrencySymbolText(
          cryptocurrency,
          symbol
        );

      await this.sendMessage(chat_id, text, extra);

      return;
    }

    const cryptocurrencyMongo = await this._cryptocurrencyService.findOne(
      cryptocurrency.data[symbol].id
    );

    const user = await this._userService.findOne(user_id);

    if (user === null || cryptocurrencyMongo === null) {
      const { text, extra } =
        this._telegramTextFormattedService.getCurrencySymbolText(
          cryptocurrency,
          symbol,
          false,
          cryptocurrency.data[symbol].id
        );

      await this.sendMessage(chat_id, text, extra);
    } else {
      const favoriteCryptocurrency =
        await this._favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
          user._id,
          cryptocurrencyMongo._id
        );

      const { text, extra } =
        this._telegramTextFormattedService.getCurrencySymbolText(
          cryptocurrency,
          symbol,
          favoriteCryptocurrency === null ? false : true,
          favoriteCryptocurrency === null
            ? cryptocurrency.data[symbol].id
            : favoriteCryptocurrency._id.toString()
        );

      await this.sendMessage(chat_id, text, extra);
    }
  };

  public saveFavoriteCryptocurrencyCommand = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this._cryptoProcessorService.getCryptocurrency(
      symbol
    );

    if (cryptocurrency.data === undefined) {
      await this.badRequest(chat_id);
      return;
    }

    await this.saveFavoriteCryptocurrency(
      chat_id,
      message_id,
      user_id,
      cryptocurrency.data[symbol].id,
      symbol,
      true
    );
  };

  public saveFavoriteCryptocurrency = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    cryptocurrency_id: number,
    symbol: string,
    isSend = false
  ) => {
    let cryptocurrency = await this._cryptocurrencyService.findOne(
      cryptocurrency_id
    );

    let user = await this._userService.findOne(user_id);

    if (user === null) {
      user = await this._userService.insertOne({
        user_tg_id: user_id,
      });
    }

    if (cryptocurrency === null) {
      cryptocurrency = await this._cryptocurrencyService.insertOne({
        id_in_coin_market_cap: cryptocurrency_id,
      });
    }

    if (user === null || cryptocurrency === null) {
      await this.badRequest(chat_id);
      return;
    }

    const existFavoriteCryptocurrency =
      await this._favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
        user._id,
        cryptocurrency._id
      );

    if (existFavoriteCryptocurrency !== null) {
      const text =
        this._telegramTextFormattedService.alreadyExistFavoriteCryptocurrency(
          symbol
        );
      await this.sendMessage(chat_id, text);
      return;
    }

    const favoriteCryptocurrency =
      await this._favoriteCryptocurrencyService.insertOne({
        cryptocurrency: cryptocurrency._id,
        user: user._id,
      });

    if (favoriteCryptocurrency === null) {
      await this.badRequest(chat_id);
    }

    const text =
      this._telegramTextFormattedService.favoriteCryptocurrencyNoticeText(
        symbol,
        ETelegramButtonType.ADD_FAVORITE
      );

    if (isSend === true) {
      await this.sendMessage(chat_id, text);
    } else {
      await this.updateMessage(chat_id, message_id, text);
    }
  };

  public removeFromFavoriteCryptocurrencyCommand = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this._cryptoProcessorService.getCryptocurrency(
      symbol
    );

    if (cryptocurrency.data === undefined) {
      await this.badRequest(chat_id);
      return;
    }

    let cryptocurrencyMongo = await this._cryptocurrencyService.findOne(
      cryptocurrency.data[symbol].id
    );

    let user = await this._userService.findOne(user_id);

    if (user === null || cryptocurrencyMongo === null) {
      await this.badRequest(chat_id);
      return;
    }

    const favoriteCryptocurrency =
      await this._favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
        user._id,
        cryptocurrencyMongo._id
      );

    if (favoriteCryptocurrency === null) {
      const text =
        this._telegramTextFormattedService.nothingToDeleteFromFavoriteCryptocurrency(
          symbol
        );
      await this.sendMessage(chat_id, text);
      return;
    }

    await this.removeFromFavoriteCryptocurrency(
      chat_id,
      message_id,
      favoriteCryptocurrency._id.toString(),
      symbol,
      true
    );
  };

  public removeFromFavoriteCryptocurrency = async (
    chat_id: number | string,
    message_id: number,
    cryptocurrency_id: string,
    symbol: string,
    isSend = false
  ) => {
    try {
      await this._favoriteCryptocurrencyService.deleteOne(
        new ObjectId(cryptocurrency_id)
      );

      const text =
        this._telegramTextFormattedService.favoriteCryptocurrencyNoticeText(
          symbol,
          ETelegramButtonType.REMOVE_FAVORITE
        );

      if (isSend === true) {
        await this.sendMessage(chat_id, text);
      } else {
        await this.updateMessage(chat_id, message_id, text);
      }
    } catch (e) {
      console.log(e);
      await this.badRequest(chat_id);
    }
  };

  public listFavorite = async (chat_id: number | string, user_id: number) => {
    const user = await this._userService.findOne(user_id);

    let text = '';

    if (user === null) {
      text = this._telegramTextFormattedService.listRecentText(false, true);
      await this.sendMessage(chat_id, text);
      return;
    }

    const favoriteCryptocurrencies =
      await this._favoriteCryptocurrencyService.aggregation<IFavoriteCryptocurrencyWithRelationships>(
        [
          {
            $lookup: {
              from: 'cryptocurrencies',
              localField: 'cryptocurrency',
              foreignField: '_id',
              as: 'cryptocurrency',
            },
          },
          {
            $match: {
              cryptocurrency: { $exists: true, $type: 'array', $ne: [] },
              user: {
                $eq: user._id,
              },
            },
          },
        ] as unknown as Document[]
      );

    if (
      favoriteCryptocurrencies === undefined ||
      favoriteCryptocurrencies.length === 0
    ) {
      text = this._telegramTextFormattedService.listRecentText(false, true);
      await this.sendMessage(chat_id, text);
      return;
    }

    const cryptocurrencies =
      await this._cryptoProcessorService.getListOfFavoriteCryptocurrencies(
        favoriteCryptocurrencies.map(
          (it) => it.cryptocurrency[0].id_in_coin_market_cap
        )
      );

    text = this._telegramTextFormattedService.listRecentText(
      false,
      true,
      cryptocurrencies
    );

    await this.sendMessage(chat_id, text);
  };
}
