/**
 * @module controllers/organ/sources
 * @desc Provides controllers for organ sources.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../../models/Organ';
import OrganSource from '../../models/OrganSource';

/**
 * Gets the sources of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const sources = await organ.sources();
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const source = await organ.add(req.body.url);
  res.send({ 'success': true, source, });
};

/**
 * Updates a source of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.update(new OrganSource(parseInt(req.params.sid), req.body.url));
  res.send({ 'success': true });
};

/**
 * Removes a source from the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.remove(new OrganSource(parseInt(req.params.sid), ''));
  res.send({ 'success': true });
};
