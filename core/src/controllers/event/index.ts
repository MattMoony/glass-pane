/**
 * @module controllers/event
 * @desc Provides controllers for event management.
 * @requires express
 */

import { Request, Response } from 'express';

import Event from '../../models/Event';
import Organ from '../../models/Organ';

import { CheckTemplate } from '../../middleware';

/**
 * The required query formats for the endpoints defined here.
 */
export const QUERIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * The required body formats for the endpoints defined here.
 */
export const BODIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * The required query format for the search endpoint.
 */
QUERIES.SEARCH = {
  q: { type: 'string', optional: true, },
  participant: { type: 'string', optional: true, },
  date: { type: 'string', optional: true, },
  days: { type: 'string', optional: true, },
};

/**
 * Searches for events.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  let events = undefined;

  const query = req.query.q !== undefined ? (req.query.q as string).trim().toLowerCase() : undefined;
  const participant = req.query.participant !== undefined ? await Organ.get(parseInt(req.query.participant as string)) : undefined;
  if (participant === null) {
    res.send({ 'success': false, 'error': 'Invalid participant.', });
    return;
  }
  const date = req.query.date !== undefined ? new Date(req.query.date as string) : undefined;
  const days = req.query.days !== undefined ? parseInt(req.query.days as string) : undefined;

  if (query && participant) {
    events = await Event.find(query, participant);
  }
  else if (query) {
    events = await Event.find(query);
  }
  else if (participant) {
    events = await Event.find(participant);
  }
  else if (date && days) {
    events = await Event.find(date, days);
  }
  else if (date) {
    events = await Event.find(date);
  }
  
  if (events === undefined) {
    res.send({ 'success': false, 'error': 'Invalid query.', });
    return;
  }
  res.send({ 'success': true, events, });
};

/**
 * The required body format for the create endpoint.
 */
BODIES.CREATE = {
  name: { type: 'string', },
  desc: { type: 'string', optional: true, },
  date: { type: 'string', optional: true, },
  location: { type: 'number', optional: true, },
};

/**
 * Creates a new event.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const { name, desc, date, location } = req.body;
  const event = await Event.create(
    name, 
    desc, 
    date ? new Date(date) : undefined, 
    location
  );
  res.send({ 'success': true, event });
};

/**
 * Gets an event.
 * @param req The request object.
 * @param res The response object (with `res.locals.event`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  res.send({ 'success': true, 'event': res.locals.event as Event });
};
