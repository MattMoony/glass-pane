import { Request, Response } from 'express';

export const create = (req: Request, res: Response): void => {
  res.send({ asdf: 8, })
};
