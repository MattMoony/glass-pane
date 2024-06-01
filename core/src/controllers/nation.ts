import { Request, Response } from 'express';

import Location from '../models/Location';
import Nation from '../models/Nation';
import { CheckTemplate } from '../middleware';
import * as organizationController from '../controllers/organization';

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
 * Searches for nations.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const nations = await Nation.find(req.query.q as string);
  res.send({ 'success': true, 'nations': nations.map(nation => nation.json()), });
};

/**
 * The required body format for creating a nation.
 */
BODIES.CREATE = {
  ...organizationController.BODIES.CREATE,
  location: { type: 'number', },
};

/**
 * Creates a new nation.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const location = await Location.get(req.body.location);
  if (!location) {
    res.send({ 'success': false, 'msg': 'location not found' });
    return;
  }
  const nation = await Nation.create(
    req.body.bio,
    req.body.name,
    req.body.established,
    req.body.dissolved,
    location
  );
  res.send({ 'success': true, 'nation': nation.json(), });
};

/**
 * Gets a nation by its ID.
 * @param req The request object.
 * @param res The response object.
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  res.send({ 'success': true, 'nation': (res.locals.nation as Nation).json(), });
};

/**
 * The required body format for updating a nation.
 */
BODIES.UPDATE = {
  ...organizationController.BODIES.UPDATE,
  location: { type: 'number', },
};

/**
 * Updates a nation.
 * @param req The request object.
 * @param res The response object.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const nation = res.locals.nation as Nation;
  if (req.body.bio) nation.bio = req.body.bio;
  if (req.body.name) nation.name = req.body.name;
  if (req.body.established) nation.established = req.body.established;
  if (req.body.dissolved) nation.dissolved = req.body.dissolved;
  if (req.body.location) {
    const location = await Location.get(req.body.location);
    if (!location) {
      res.send({ 'success': false, 'msg': 'location not found' });
      return;
    }
    nation.location = location;
  }
  await nation.update();
  res.send({ 'success': true, 'nation': nation.json(), });
};

/**
 * Removes a nation.
 * @param req The request object.
 * @param res The response object.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const nation = res.locals.nation as Nation;
  await nation.remove();
  res.send({ 'success': true, });
};
