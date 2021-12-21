import { Request, Response, Router } from 'express';
import CryptoProcessorService from './crypto-processor.service';
import QueryService from '../query/query.service';
import { IQueryResponse } from '../query';
import {
  ICryptoProcessorGetCryptocurrencyRequestBody,
  ICryptoProcessorPreparedCryptocurrency,
} from './interface';

export default (router: typeof Router) => {
  const routes = router();
  const cryptoProcessorService = new CryptoProcessorService();
  const queryService = new QueryService();

  routes.get('/', async (req: Request, res: Response) => {
    const answer = await cryptoProcessorService.getListOfCryptocurrencies();

    return queryService.sendAnswer<
      IQueryResponse<ICryptoProcessorPreparedCryptocurrency[]>
    >(200, answer, res);
  });

  routes.get(
    '/:symbol',
    async (
      req: Request<ICryptoProcessorGetCryptocurrencyRequestBody>,
      res: Response
    ) => {
      const answer = await cryptoProcessorService.getCryptocurrency(
        req.params.symbol
      );

      return queryService.sendAnswer<
        IQueryResponse<ICryptoProcessorPreparedCryptocurrency>
      >(200, answer, res);
    }
  );

  return routes;
};
