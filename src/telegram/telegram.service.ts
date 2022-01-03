import {
  ITelegramCommandRessponse,
  ITelegramFavoriteCryptocurrencyRelations,
  ITelegramQueryBody,
  ITelegramQueryHeaders,
  ITelegramResponse,
  ITelegramTextFormatterExtra,
  ITelegramUpdateQueryBody,
  ITelegramUpdateResponse,
} from '.';
import CryptoProcessorService from '../crypto-processor/crypto-processor.service';
import { IQueryAttributes } from '../query';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';
import ETelegramButtonType from './enum/button-type.enum';
import { Cryptocurrency, FavoriteCryptocurrency, User } from './models';
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
      throw new Error(
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
      throw new Error(
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

    const cryptocurrencyMongo = await Cryptocurrency.findOne({
      id_in_coin_market_cap: cryptocurrency.data[symbol].id,
    }).exec();

    const user = await User.findOne({
      user_tg_id: user_id,
    }).exec();

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
      const favoriteCryptocurrency = await FavoriteCryptocurrency.findOne({
        coin_market_cap: cryptocurrencyMongo._id,
        user: user._id,
      }).exec();

      const { text, extra } =
        this._telegramTextFormattedService.getCurrencySymbolText(
          cryptocurrency,
          symbol,
          favoriteCryptocurrency === null ? false : true,
          favoriteCryptocurrency === null
            ? cryptocurrency.data[symbol].id
            : favoriteCryptocurrency._id
        );

      await this.sendMessage(chat_id, text, extra);
    }
  };

  public saveFavoriteCryptocurrency = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    cryptocurrency_id: number,
    symbol: string
  ) => {
    let cryptocurrency = await Cryptocurrency.findOne({
      id_in_coin_market_cap: cryptocurrency_id,
    }).exec();

    let user = await User.findOne({
      user_tg_id: user_id,
    }).exec();

    if (user === null) {
      const preparedUser = new User({
        user_tg_id: user_id,
      });

      await preparedUser.save().then(async (res) => {
        user = res;
      });
    }

    if (cryptocurrency === null) {
      const preparedCryptocurrency = new Cryptocurrency({
        id_in_coin_market_cap: cryptocurrency_id,
      });

      await preparedCryptocurrency.save().then(async (res) => {
        cryptocurrency = res;
      });
    }

    if (user === null || cryptocurrency === null) {
      await this.badRequest(chat_id);
    } else {
      const favoriteCryptocurrency = new FavoriteCryptocurrency({
        coin_market_cap: cryptocurrency._id,
        user: user._id,
      });

      await favoriteCryptocurrency
        .save()
        .then(async (res) => {
          const text =
            this._telegramTextFormattedService.favoriteCryptocurrencyNoticeText(
              symbol,
              ETelegramButtonType.ADD_FAVORITE
            );

          await this.updateMessage(chat_id, message_id, text);
        })
        .catch(async (err) => {
          console.log(err);
          await this.badRequest(chat_id);
        });
    }
  };

  public removeFromFavoriteCryptocurrency = async (
    chat_id: number | string,
    message_id: number,
    cryptocurrency_id: string,
    symbol: string
  ) => {
    await FavoriteCryptocurrency.findByIdAndDelete(cryptocurrency_id)
      .then(async (res) => {
        const text =
          this._telegramTextFormattedService.favoriteCryptocurrencyNoticeText(
            symbol,
            ETelegramButtonType.REMOVE_FAVORITE
          );

        await this.updateMessage(chat_id, message_id, text);
      })
      .catch(async (err) => {
        console.log(err);
        await this.badRequest(chat_id);
      });
  };

  public listFavorite = async (chat_id: number | string, user_id: number) => {
    const user = await User.findOne({
      user_tg_id: user_id,
    }).exec();

    let text = '';

    if (user === null) {
      text = this._telegramTextFormattedService.listRecentText(false, true);
    } else {
      const favoriteCryptocurrencies =
        await FavoriteCryptocurrency.aggregate<ITelegramFavoriteCryptocurrencyRelations>(
          [
            {
              $lookup: {
                from: 'cryptocurrencies',
                localField: 'coin_market_cap',
                foreignField: '_id',
                as: 'coin_market_cap',
              },
            },
            {
              $match: {
                coin_market_cap: { $exists: true, $type: 'array', $ne: [] },
                user: {
                  $eq: user._id,
                },
              },
            },
          ]
        );

      if (favoriteCryptocurrencies.length === 0) {
        text = this._telegramTextFormattedService.listRecentText(false, true);
      } else {
        const cryptocurrencies =
          await this._cryptoProcessorService.getListOfFavoriteCryptocurrencies(
            favoriteCryptocurrencies.map(
              (it) => it.coin_market_cap[0].id_in_coin_market_cap
            )
          );

        text = this._telegramTextFormattedService.listRecentText(
          false,
          true,
          cryptocurrencies
        );
      }
    }

    await this.sendMessage(chat_id, text);
  };
}
