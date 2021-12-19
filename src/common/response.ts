import { Response } from 'express';

export const sendAnswer = (status: number, values: any, res: Response) => {
  res.status(status);
  return res.send({
    status,
    ...values,
  });
};

/*
export const sendRequest = (status: number, values: any, res: Response) => {
  res.status(status);
  return res.send({
    status,
    ...values,
  });
};
*/
