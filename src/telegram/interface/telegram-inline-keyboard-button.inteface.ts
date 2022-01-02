export interface IInlineKeyboardButton {
  text: string;
  callback_data?: string;
}

export interface IInlineKeyboardMarkup {
  inline_keyboard: IInlineKeyboardButton[][];
}
