/**
 * @module middleware/nation
 * @desc Provides middleware for nation management.
 * @requires express
 */

import { Request, Response } from 'express';

import Nation from '../models/Nation';


/**
 * Parses the nation ID from the request parameters to
 * an `Nation` object and stores it in `res.locals.nation`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const nid2nation = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.nid))) {
    res.send({ 'success': false, 'msg': 'bad nationid' });
    return;
  }
  const nation = await Nation.get(parseInt(req.params.nid));
  if (nation === null) {
    res.send({ 'success': false, 'msg': 'nation not found' });
    return;
  }
  res.locals.nation = nation;
  next();
}
