/**
 * @module controllers/organ
 * @desc Provides controllers for organ management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../../models/Organ';
import Organization from '../../models/Organization';
import Person from '../../models/Person';

export * as pic from './pic';
export * as biopic from './biopic';
export * as socials from './socials';
export * as sources from './sources';
export * as memberships from './memberships';


/**
 * Searches for organs.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.q as string).trim().toLowerCase();
  const people = await Person.find(query);
  const organizations = await Organization.find(query);
  res.send({ 'success': true, people, organizations, });
};

/**
 * Creates a new organ. No body is required.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.create(req.body.bio);
  if (!organ) 
    res.send({ 'success': false, 'msg': 'failed to create' });
  res.send({ 'success': true, organ });
};

/**
 * Gets the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  res.send({ 'success': true, 'organ': res.locals.organ as Organ });
};
