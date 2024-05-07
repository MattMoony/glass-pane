import 'process';
import { Request, Response } from 'express';

import Person from '../models/Person';
import Organization from '../models/Organization';

/**
 * Searches for people/organizations based on a query string.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  if (!req.query.q) {
    res.status(400);
    res.send({ 'success': false, 'msg': 'bad request', });
    return;
  }

  const query = (req.query.q as string).trim().toLowerCase();
  res.send({ 
    'success': true, 
    'people': await Person.find(query), 
    'organizations': await Organization.find(query),
  });
};
