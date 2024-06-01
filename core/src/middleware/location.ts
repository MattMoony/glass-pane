/**
 * @module middleware/location
 * @desc Provides middleware for location management.
 * @requires express
 */

import { Request, Response } from 'express';

import Location from '../models/Location';


/**
 * Parses the location ID from the request parameters to
 * an `Location` object and stores it in `res.locals.location`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const lid2location = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.lid))) {
    res.send({ 'success': false, 'msg': 'bad locationid' });
    return;
  }
  const location = await Location.get(parseInt(req.params.lid));
  if (location === null) {
    res.send({ 'success': false, 'msg': 'location not found' });
    return;
  }
  res.locals.location = location;
  next();
}
