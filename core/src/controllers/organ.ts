import 'process';
import { Request, Response } from 'express';

import Organ from '../models/Organ';

export const create = async (req: Request, res: Response): Promise<void> => {
  const id = await Organ.create();
  res.send({ id });
};
