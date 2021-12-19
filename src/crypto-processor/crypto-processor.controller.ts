import { Request, Response, Router } from 'express';
import sendAnswer from '../common/response';
import validate from './crypto-processor.validator';
import CryptoProcessorService from './crypto-processor.service';

export default (router: typeof Router) => {
  const routes = router();
  const cryptoProcessorService = new CryptoProcessorService();

  routes.get('/testStart', async (req: Request, res: Response) => {
    const reqData = validate.cryptoProcessorValidate.testStart(
      req.body.payload
    );

    const serviceDate = await cryptoProcessorService.testStart();

    return sendAnswer(
      200,
      {
        serviceDate,
      },
      res
    );
  });

  return routes;
};
