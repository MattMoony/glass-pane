import 'process';
import { Request, Response } from 'express';

import Person from '../models/Person';

export const search = async (req: Request, res: Response): Promise<void> => {
  if (!req.query.q) {
    res.status(400);
    res.send({ 'success': false, 'msg': 'bad request', });
    return;
  }

  const query = (req.query.q as string).trim().toLowerCase();
  const results = await Person.find(query);
  res.send({ 'success': true, 'people': results, });
};
