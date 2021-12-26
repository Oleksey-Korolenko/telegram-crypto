import { ITelegramMessage, ITelegramRessponse } from '.';

export interface ITelegramCommandMessageEntity {
  offset: number;
  length: number;
  type: string;
}

export interface ITelegramCommandMessage extends ITelegramMessage {
  entities: ITelegramCommandMessageEntity[];
}

export interface ITelegramCommandRessponse extends ITelegramRessponse {
  message: ITelegramCommandMessage;
}
