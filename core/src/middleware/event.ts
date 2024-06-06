/**
 * @module middleware/event
 * @desc Provides middleware for event management.
 * @requires express
 */

import { Request, Response } from 'express';

import Event from '../models/Event';

/**
 * Parses the event ID from the request parameters to
 * an `Event` object and stores it in `res.locals.event`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const eid2event = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.eid))) {
    res.send({ 'success': false, 'msg': 'bad eventID' });
    return;
  }
  const event = await Event.get(parseInt(req.params.eid));
  if (event === null) {
    res.send({ 'success': false, 'msg': 'event not found' });
    return;
  }
  res.locals.event = event;
  next();
};
