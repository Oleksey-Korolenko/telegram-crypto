import { ITelegramWebhookResponse } from '.';
import EQueryCode from '../query/enum/query.enum';
import QueryService from '../query/query.service';

export default class TelegramService {
  private _baseUrl;

  private _token;

  private _queryService;

  constructor() {
    this._baseUrl = process.env.TELEGRAM_WEBHOOK_HOST;
    this._token = process.env.TELEGRAM_ADMIN_TOKEN;
    this._queryService = new QueryService();
  }

  public setWebhook = async () => {
    const response = await this._queryService.get<{}, ITelegramWebhookResponse>(
      {
        hostname: 'api.telegram.org',
        path: `/bot${this._token}/setWebhook`,
        method: 'GET',
        port: 443,
        headers: {},
      },
      {
        url: `${this._baseUrl}/api/telegram/update`,
      }
    );

    if (response.code !== EQueryCode.OK || response.data?.ok === false) {
      throw new Error(
        `Can't set webhook to telegram! ${response.data?.description ?? ''}`
      );
    } else {
      console.info(response.data?.description);
    }
  };
}
