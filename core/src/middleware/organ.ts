/**
 * @module middleware/organ
 * @desc Provides middleware for organ management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../models/Organ';

/**
 * Parses the organ ID from the request parameters to
 * an `Organ` object and stores it in `res.locals.organ`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const oid2organ = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.oid))) {
    res.send({ 'success': false, 'msg': 'bad organId' });
    return;
  }
  const organ = await Organ.get(parseInt(req.params.oid));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'organ not found' });
    return;
  }
  res.locals.organ = organ;
  next();
}
