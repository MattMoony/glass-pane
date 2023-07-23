import 'process';
import { Request, Response } from 'express';

import Person from '../models/Person';

export const create = (req: Request, res: Response): void => {
  // TODO: finish implementation!
  res.send({ asdf: 8, })
};

export const get = (req: Request, res: Response): void => {
  if (process.env.NODE_ENV === 'development') {
    const p = Person.dummy();
    res.send(p.json());
    return;
  }

  // TODO: finish implementation!
  res.send({});
};
