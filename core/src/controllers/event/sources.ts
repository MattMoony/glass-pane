/**
 * @module controllers/event/sources
 * @desc Provides controllers for event source management.
 * @requires express
 */

import { Request, Response } from 'express';

import Event from '../../models/Event';
import EventSource from '../../models/EventSource';

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
 * Gets the sources of the target event.
 * @param req The request object.
 * @param res The response object (with `res.locals.event`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const event = res.locals.event as Event;
  const sources = await event.sources();
  res.send({ 'success': true, 'sources': sources });
};

/**
 * The required body format for the add endpoint.
 */
BODIES.ADD = { 
  url: { type: 'string', }, 
};

/**
 * Adds a source to the target event.
 * @param req The request object.
 * @param res The response object (with `res.locals.event`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
  const event = res.locals.event as Event;
  const source = await event.add(req.body.url);
  res.send({ 'success': true, source, });
};

/**
 * The required body format for the update endpoint.
 */
BODIES.UPDATE = { 
  url: { type: 'string', } 
};

/**
 * Updates the source of the target event.
 * @param req The request object.
 * @param res The response object (with `res.locals.event`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const event = res.locals.event as Event;
  await event.update(new EventSource(parseInt(req.params.sid), req.body.url));
};

/**
 * Removes the source of the target event.
 * @param req The request object.
 * @param res The response object (with `res.locals.event`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const event = res.locals.event as Event;
  await event.remove(new EventSource(parseInt(req.params.sid), ''));
  res.send({ 'success': true });
};
