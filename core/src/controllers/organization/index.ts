/**
 * @module controllers/organization
 * @desc Provides controllers for organization management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organization from '../../models/Organization';

export * as members from './members';

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
 * Updates an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
 
  if (req.body.bio) organization.bio = req.body.bio;
  if (req.body.name) organization.name = req.body.name;
  if (req.body.established) organization.established = new Date(req.body.established);
  if (req.body.dissolved) organization.dissolved = new Date(req.body.dissolved);
 
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
