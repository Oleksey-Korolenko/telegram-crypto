import {
  IArgsForPreparedText,
  IInlineKeyboardButton,
  IInlineKeyboardMarkup,
  ITelegramTextFormatterExtra,
  ITelegramTextFormatterResponse,
} from '.';
import ECryptoProcessorCode from '../crypto-processor/enum/crypto-processor-code.enum';
import {
  ICryptoProcessorCryptocurrency,
  ICryptoProcessorCryptocurrencySingle,
  ICryptoProcessorPreparedCryptocurrency,
} from '../crypto-processor/interface';
import { IQueryResponse } from '../query';
import EQueryCode from '../query/enum/query.enum';
import ETelegramButtonType from './enum/button-type.enum';
import messagesInRussian from './messages/ru';

export default class TelegramTextFormattedService {
  public incorrectCommandText = (): string => {
    let text = '';

    text += this.preparedText(messagesInRussian.ERROR.INCORRECT_COMMAND, {});

    return text;
  };

  public listRecentText = (
    cryptocurrencies: IQueryResponse<
      ICryptoProcessorPreparedCryptocurrency[],
      EQueryCode
    >
  ): string => {
    let text = '';

    if (cryptocurrencies.data === undefined) {
      text += this.preparedText(messagesInRussian.ERROR.DEFAULT, {});
    } else {
      text += this.preparedText(messagesInRussian.LIST_RECENT.TITLE, {});

      cryptocurrencies.data.forEach((it) => {
        text += this.preparedText(messagesInRussian.LIST_RECENT.MAIN_INFO, {
          symbol: it.symbol,
          price: `${it.priceInUSD}$`,
        });
      });
    }

    return text;
  };

  public startText = (): string => {
    let text = '';

    text += this.preparedText(messagesInRussian.START, {});

    return text;
  };

  public helpText = (): string => {
    let text = '';

    const help: { [key: string]: string } = messagesInRussian.HELP;

    for (const key in help) {
      if (!help[key]) {
        continue;
      }
      text += this.preparedText(help[key], {});
    }

    return text;
  };

  public getCurrencySymbolText = (
    cryptocurrency: IQueryResponse<
      ICryptoProcessorCryptocurrencySingle,
      ECryptoProcessorCode
    >,
    symbol: string,
    alreadyExist?: boolean,
    idFavorite?: number | string
  ): ITelegramTextFormatterResponse => {
    let text = '';
    let extra: ITelegramTextFormatterExtra = {};

    switch (cryptocurrency.code) {
      case ECryptoProcessorCode.BAD_REQUEST: {
        text += this.preparedText(messagesInRussian.ERROR.DEFAULT, {});
        break;
      }
      case ECryptoProcessorCode.INVALID_SYMBOL: {
        text += this.preparedText(messagesInRussian.ERROR.INVALID_SYMBOL, {});
        break;
      }
      case ECryptoProcessorCode.OK: {
        if (
          cryptocurrency.data === undefined ||
          cryptocurrency.data[symbol] === undefined
        ) {
          text += this.preparedText(messagesInRussian.ERROR.DEFAULT, {});
        } else {
          const currentData = cryptocurrency.data[symbol];

          text += this.preparedText(
            messagesInRussian.CURRENT_CURRENCY.TITLE,
            {}
          );

          text += this.preparedText(
            messagesInRussian.CURRENT_CURRENCY.MAIN_INFO,
            {
              symbol: currentData.symbol,
              name: currentData.name,
              is_active: currentData.is_active === 1 ? 'активна' : 'не активна',
            }
          );

          text += this.preparedText(messagesInRussian.CURRENT_CURRENCY.SUPLY, {
            circulating_supply: currentData.circulating_supply,
            total_supply: currentData.total_supply,
            max_supply: currentData.max_supply,
          });

          const quote = currentData.quote.USD;

          text += this.preparedText(messagesInRussian.CURRENT_CURRENCY.QUOTE, {
            price: `${quote.price}$`,
            volume_24h: `${quote.volume_24h}$`,
            volume_change_24h: `${quote.volume_change_24h}%`,
            percent_change_1h: `${quote.percent_change_1h}%`,
            percent_change_24h: `${quote.percent_change_24h}%`,
            percent_change_7d: `${quote.percent_change_7d}%`,
            percent_change_30d: `${quote.percent_change_30d}%`,
            percent_change_60d: `${quote.percent_change_60d}%`,
            percent_change_90d: `${quote.percent_change_90d}%`,
            market_cap: `${quote.market_cap}$`,
            market_cap_dominance: `${quote.market_cap_dominance}%`,
          });

          if (alreadyExist !== undefined && idFavorite !== undefined) {
            extra.reply_markup = this.getCurrencySymbolKeyboardMarkup(
              alreadyExist,
              idFavorite,
              currentData.symbol
            );
          }
        }

        break;
      }
    }

    return { text, extra };
  };

  public favoriteCryptocurrencyNoticeText = (
    symbol: string,
    typeOperation: ETelegramButtonType
  ): string => {
    let text = '';

    switch (typeOperation) {
      case ETelegramButtonType.ADD_FAVORITE: {
        text += this.preparedText(
          messagesInRussian.CURRENT_CURRENCY.NOTICE.ADD,
          {
            symbol,
          }
        );

        break;
      }
      case ETelegramButtonType.REMOVE_FAVORITE: {
        text += this.preparedText(
          messagesInRussian.CURRENT_CURRENCY.NOTICE.REMOVE,
          {
            symbol,
          }
        );

        break;
      }
    }

    return text;
  };

  private getCurrencySymbolKeyboardMarkup = (
    alreadyExist: boolean,
    idFavorite: number | string,
    symbol: string
  ): IInlineKeyboardMarkup => {
    return {
      inline_keyboard: [
        alreadyExist && [
          {
            text: messagesInRussian.CURRENT_CURRENCY.BUTTON.REMOVE,
            callback_data: `remove_favorite:${idFavorite},${symbol}`,
          },
        ],
        !alreadyExist && [
          {
            text: messagesInRussian.CURRENT_CURRENCY.BUTTON.ADD,
            callback_data: `add_favorite:${idFavorite},${symbol}`,
          },
        ],
      ].filter(Boolean) as IInlineKeyboardButton[][],
    };
  };

  public badRequestText = (): string => {
    return this.preparedText(messagesInRussian.ERROR.DEFAULT, {});
  };

  private preparedText = (text: string, args: IArgsForPreparedText): string => {
    const textVatiableForReplace = text.match(/\{[A-Za-z_0-9]+\}/g);

    if (textVatiableForReplace === null) {
      return text;
    }

    let preparedText: string = '';

    textVatiableForReplace.forEach((it) => {
      const arg = args[it.split('{')[1].split('}')[0]];

      if (preparedText === '') {
        preparedText = text.replace(
          it,
          `${arg === null || arg === undefined ? 'информация неизвестна' : arg}`
        );
      } else {
        preparedText = preparedText.replace(
          it,
          `${arg === null || arg === undefined ? 'информация неизвестна' : arg}`
        );
      }
    });

    return preparedText;
  };
}
