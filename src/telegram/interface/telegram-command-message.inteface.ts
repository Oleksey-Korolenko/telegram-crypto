import {
  ITelegramMessage,
  ITelegramMessageEntity,
  ITelegramUpdateResponse,
} from '.';

export interface ITelegramCommandMessage extends ITelegramMessage {
  entities: ITelegramMessageEntity[];
}

export interface ITelegramCommandRessponse extends ITelegramUpdateResponse {
  message: ITelegramCommandMessage;
}
