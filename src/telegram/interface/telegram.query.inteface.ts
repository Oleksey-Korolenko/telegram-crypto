export interface ITelegramQueryHeaders {
  'Content-Type': string;
}

export interface ITelegramQueryBody {
  chat_id: number | string;
  text: string;
  [key: string]: string | number;
}
