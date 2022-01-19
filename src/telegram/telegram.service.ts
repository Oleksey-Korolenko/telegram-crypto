import { ObjectId } from 'mongodb';
import { ITelegramCommandRessponse, ITelegramUpdateResponse } from '.';
import CryptocurrencyService from '../cryptocurrency/cryptocurrency.service';
import { IFavoriteCryptocurrencyWithRelationships } from '../favorite-cryptocurrency';
import FavoriteCryptocurrencyService from '../favorite-cryptocurrency/favorite-cryptocurrency.service';
import UserService from '../user/user.service';
import ETelegramButtonType from './enum/button-type.enum';
import ETelegramCommandType from './enum/command-type.enum';
import TelegramApiService from './telegram.api.service';
import TelegramView from './telegram.view';

export default class TelegramService {
  #telegramApiService;
  #telegramView;
  #userService;
  #cryptocurrencyService;
  #favoriteCryptocurrencyService;

  constructor() {
    this.#telegramApiService = new TelegramApiService();
    this.#telegramView = TelegramView;
    this.#userService = new UserService();
    this.#cryptocurrencyService = new CryptocurrencyService();
    this.#favoriteCryptocurrencyService = new FavoriteCryptocurrencyService();
  }

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
      await this.#cryptocurrencyService.getListOfCryptocurrencies();

    const text = this.#telegramView.listRecentText(
      false,
      false,
      cryptocurrencies
    );

    await this.#telegramApiService.sendMessage(chat_id, text);
  };

  public start = async (chat_id: number | string) => {
    const text = this.#telegramView.startText();

    await this.#telegramApiService.sendMessage(chat_id, text);
  };

  public help = async (chat_id: number | string) => {
    const text = this.#telegramView.helpText();

    await this.#telegramApiService.sendMessage(chat_id, text);
  };

  public incorrectCommand = async (chat_id: number | string) => {
    const text = this.#telegramView.incorrectCommandText();

    await this.#telegramApiService.sendMessage(chat_id, text);
  };

  public badRequest = async (chat_id: number | string) => {
    const text = this.#telegramView.badRequestText();

    await this.#telegramApiService.sendMessage(chat_id, text);
  };

  private getCurrencySymbol = async (
    chat_id: number | string,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this.#cryptocurrencyService.getCryptocurrency(
      symbol
    );

    if (cryptocurrency.data === undefined) {
      const { text, extra } = this.#telegramView.getCurrencySymbolText(
        cryptocurrency,
        symbol
      );

      await this.#telegramApiService.sendMessage(chat_id, text, extra);

      return;
    }

    const cryptocurrencyMongo = await this.#cryptocurrencyService.findOne(
      cryptocurrency.data[symbol].id
    );

    const user = await this.#userService.findOne(user_id);

    if (user === null || cryptocurrencyMongo === null) {
      const { text, extra } = this.#telegramView.getCurrencySymbolText(
        cryptocurrency,
        symbol,
        false,
        cryptocurrency.data[symbol].id
      );

      await this.#telegramApiService.sendMessage(chat_id, text, extra);
    } else {
      const favoriteCryptocurrency =
        await this.#favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
          user._id,
          cryptocurrencyMongo._id
        );

      const { text, extra } = this.#telegramView.getCurrencySymbolText(
        cryptocurrency,
        symbol,
        favoriteCryptocurrency === null ? false : true,
        favoriteCryptocurrency === null
          ? cryptocurrency.data[symbol].id
          : favoriteCryptocurrency._id.toString()
      );

      await this.#telegramApiService.sendMessage(chat_id, text, extra);
    }
  };

  public saveFavoriteCryptocurrencyCommand = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this.#cryptocurrencyService.getCryptocurrency(
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
    const cryptocurrency = await this.#cryptocurrencyService.findOneOrInsert({
      id_in_coin_market_cap: cryptocurrency_id,
    });

    const user = await this.#userService.findOneOrInsert({
      user_tg_id: user_id,
    });

    if (user === null || cryptocurrency === null) {
      await this.badRequest(chat_id);
      return;
    }

    const existFavoriteCryptocurrency =
      await this.#favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
        user._id,
        cryptocurrency._id
      );

    if (existFavoriteCryptocurrency !== null) {
      const text =
        this.#telegramView.alreadyExistFavoriteCryptocurrency(symbol);
      await this.#telegramApiService.sendMessage(chat_id, text);
      return;
    }

    const favoriteCryptocurrency =
      await this.#favoriteCryptocurrencyService.insertOne({
        cryptocurrency: cryptocurrency._id,
        user: user._id,
      });

    if (favoriteCryptocurrency === null) {
      await this.badRequest(chat_id);
    }

    const text = this.#telegramView.favoriteCryptocurrencyNoticeText(
      symbol,
      ETelegramButtonType.ADD_FAVORITE
    );

    if (isSend === true) {
      await this.#telegramApiService.sendMessage(chat_id, text);
    } else {
      await this.#telegramApiService.updateMessage(chat_id, message_id, text);
    }
  };

  public removeFromFavoriteCryptocurrencyCommand = async (
    chat_id: number | string,
    message_id: number,
    user_id: number,
    symbol: string
  ) => {
    const cryptocurrency = await this.#cryptocurrencyService.getCryptocurrency(
      symbol
    );

    if (cryptocurrency.data === undefined) {
      await this.badRequest(chat_id);
      return;
    }

    let cryptocurrencyMongo = await this.#cryptocurrencyService.findOne(
      cryptocurrency.data[symbol].id
    );

    let user = await this.#userService.findOne(user_id);

    if (user === null || cryptocurrencyMongo === null) {
      await this.badRequest(chat_id);
      return;
    }

    const favoriteCryptocurrency =
      await this.#favoriteCryptocurrencyService.findOneByUserIdAndCryptocurrencyId(
        user._id,
        cryptocurrencyMongo._id
      );

    if (favoriteCryptocurrency === null) {
      const text =
        this.#telegramView.nothingToDeleteFromFavoriteCryptocurrency(symbol);
      await this.#telegramApiService.sendMessage(chat_id, text);
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
      await this.#favoriteCryptocurrencyService.deleteOne(
        new ObjectId(cryptocurrency_id)
      );

      const text = this.#telegramView.favoriteCryptocurrencyNoticeText(
        symbol,
        ETelegramButtonType.REMOVE_FAVORITE
      );

      if (isSend === true) {
        await this.#telegramApiService.sendMessage(chat_id, text);
      } else {
        await this.#telegramApiService.updateMessage(chat_id, message_id, text);
      }
    } catch (e) {
      console.log(e);
      await this.badRequest(chat_id);
    }
  };

  public listFavorite = async (chat_id: number | string, user_id: number) => {
    const user = await this.#userService.findOne(user_id);

    let text = '';

    if (user === null) {
      text = this.#telegramView.listRecentText(false, true);
      await this.#telegramApiService.sendMessage(chat_id, text);
      return;
    }

    const favoriteCryptocurrencies =
      await this.#favoriteCryptocurrencyService.aggregation<IFavoriteCryptocurrencyWithRelationships>(
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
      text = this.#telegramView.listRecentText(false, true);
      await this.#telegramApiService.sendMessage(chat_id, text);
      return;
    }

    const cryptocurrencies =
      await this.#cryptocurrencyService.getListOfFavoriteCryptocurrencies(
        favoriteCryptocurrencies.map(
          (it) => it.cryptocurrency[0].id_in_coin_market_cap
        )
      );

    text = this.#telegramView.listRecentText(false, true, cryptocurrencies);

    await this.#telegramApiService.sendMessage(chat_id, text);
  };
}
