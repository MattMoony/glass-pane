/**
 * @module middleware/person
 * @desc Provides middleware for person management.
 * @requires express
 */

import { Request, Response } from 'express';

import Person from '../models/Person';

/**
 * Parses the user ID from the request parameters to
 * a `Person` object and stores it in `res.locals.person`.
 * @param req The request object.
 * @param res The response object.
 */
export const pid2person = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.pid))) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  const person = await Person.get(parseInt(req.params.pid));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'person not found' });
    return;
  }
  res.locals.person = person;
  next();
}
