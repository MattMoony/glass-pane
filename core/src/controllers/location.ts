import { Request, Response } from 'express';

import Location from '../models/Location';
import { CheckTemplate } from '../middleware';

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
  q: { type: 'string', },
};

/**
 * Searches for locations.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const locations = await Location.find(req.query.q as string);
  res.send({ 'success': true, 'locations': locations.map(location => location.json()), });
};

/**
 * The required body format for creating a location.
 */
BODIES.CREATE = {
  name: { type: 'string', },
  coords: { type: 'array', items: 'number', },
};

/**
 * Creates a new location.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const location = await Location.create(req.body.name, req.body.coords);
  res.send({ 'success': true, 'location': location.json(), });
};

/**
 * Gets a location by its ID.
 * @param req The request object.
 * @param res The response object.
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  res.send({ 'success': true, 'location': (res.locals.location as Location).json(), });
};

/**
 * The required body format for updating a location.
 */
BODIES.UPDATE = {
  name: { type: 'string', optional: true, },
  coords: { type: 'array', items: 'number', optional: true, nullable: true, },
};

/**
 * Updates a location.
 * @param req The request object.
 * @param res The response object.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const location = res.locals.location as Location;
  if (req.body.name) location.name = req.body.name;
  if (req.body.coords) location.coords = req.body.coords;
  await location.update();
  res.send({ 'success': true, 'location': location.json(), });
};

/**
 * Removes a location.
 * @param req The request object.
 * @param res The response object.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const location = res.locals.location as Location;
  await location.remove();
  res.send({ 'success': true, });
};
