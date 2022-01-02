import { ITelegramTextFormatterExtra } from '.';

export interface ITelegramQueryHeaders {
  'Content-Type': string;
}

export interface ITelegramQueryBody extends ITelegramTextFormatterExtra {
  chat_id: number | string;
  text: string;
}

export interface ITelegramResponse {
  ok: boolean;
  result: boolean;
  description: string;
}
