import {
  ITelegramMessage,
  ITelegramMessageEntity,
  ITelegramMessageFrom,
} from '.';

export interface ITelegramButtonMessage extends ITelegramMessage {
  entities: ITelegramMessageEntity[];
}

export interface ITelegramButtonCallbackQuery {
  id: string;
  from: ITelegramMessageFrom;
  message: ITelegramButtonMessage;
  chat_instance: string;
  data: string;
}

export interface ITelegramButtonResponse {
  update_id: number;
  callback_query: ITelegramButtonCallbackQuery;
}
