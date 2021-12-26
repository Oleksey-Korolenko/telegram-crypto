import { Response } from 'express';
import { request, RequestOptions } from 'https';
import { IQueryAttributes, IQueryParams, IQueryResponse } from '.';
import EQueryCode from './enum/query.enum';

export default class QueryService {
  public sendRequest = async <Headers, ResponseType, BodyType>(
    attributes: IQueryAttributes<Headers>,
    params: IQueryParams,
    body?: BodyType
  ): Promise<IQueryResponse<ResponseType>> => {
    let preparedParams = '';

    for (const key in params) {
      if (!params[key]) {
        continue;
      }

      preparedParams += `${key}=${params[key]}&`;
    }

    return await new Promise<IQueryResponse<ResponseType>>(
      (resolve, reject) => {
        const req = request(
          {
            ...attributes,
            path: `${attributes.path}?${preparedParams}`,
          } as unknown as RequestOptions,
          (res) => {
            let responseBody = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              responseBody += chunk;
            });
            res.on('end', () => {
              resolve({
                code: EQueryCode.OK,
                message: 'Everything is correct!',
                data: JSON.parse(responseBody),
              } as IQueryResponse<ResponseType>);
            });
          }
        );

        if (body !== undefined) {
          req.write(JSON.stringify(body));
        }

        req.on('error', (e) => {
          reject({
            code: EQueryCode.BAD_REQUEST,
            message: e.message ?? 'Bad request!',
          } as IQueryResponse<ResponseType>);
        });

        req.end();
      }
    );
  };

  public sendAnswer = <ResponseType>(
    status: number,
    values: ResponseType,
    res: Response
  ) => {
    res.status(status);
    return res.send({
      status,
      data: values,
    });
  };
}
