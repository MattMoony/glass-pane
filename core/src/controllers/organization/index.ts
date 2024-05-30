/**
 * @module controllers/organization
 * @desc Provides controllers for organization management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organization from '../../models/Organization';

import { CheckTemplate } from '../../middleware';

export * as members from './members';


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
 * Searches for organizations.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const organizations = await Organization.find(req.query.q as string);
  res.send({ 'success': true, 'organizations': organizations.map(organization => organization.json()), });
};

/**
 * Get a random organization.
 * @param req The request object.
 * @param res The response object.
 */
export const random = async (req: Request, res: Response): Promise<void> => {
  const organization = await Organization.getRandom();
  if (!organization) {
    res.send({ 'success': false, 'msg': 'no organizations', });
    return;
  }
  res.send({ 'success': true, 'organization': organization.json(), });
}

/**
 * The required body format for the create endpoint.
 */
BODIES.CREATE = {
  name: { type: 'string', },
  bio: { type: 'string', optional: true, },
  established: { type: 'string', optional: true, nullable: true, },
  dissolved: { type: 'string', optional: true, nullable: true, },
};

/**
 * Creates a new organization.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.name) {
    res.send({ 'success': false, 'msg': 'missing name', });
    return;
  }
  const established = req.body.established ? new Date(req.body.established) : undefined;
  const dissolved = req.body.dissolved ? new Date(req.body.dissolved) : undefined;
  const organization = await Organization.create(req.body.name, req.body.bio||'', established, dissolved);
  res.send({ 'success': true, 'organization': organization });
};

/**
 * Gets an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  res.send({ 'success': true, 'organization': organization.json(), });
};

/**
 * The required body format for the update endpoint.
 */
BODIES.UPDATE = {
  name: { type: 'string', optional: true, },
  bio: { type: 'string', optional: true, },
  established: { type: 'string', optional: true, nullable: true, },
  dissolved: { type: 'string', optional: true, nullable: true, },
};

/**
 * Updates an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
 
  if (req.body.bio) organization.bio = req.body.bio;
  if (req.body.name) organization.name = req.body.name;
  if (req.body.established !== undefined) organization.established = req.body.established ? new Date(req.body.established) : null;
  if (req.body.dissolved !== undefined) organization.dissolved = req.body.dissolved ? new Date(req.body.dissolved) : null;
 
  await organization.update();
  res.send({ 'success': true, 'organization': organization.json(), });
}

/**
 * Removes an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  await organization.remove();
  res.send({ 'success': true, });
}
