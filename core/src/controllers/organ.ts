import 'process';
import { Request, Response } from 'express';

import Organ from '../models/Organ';
import OrganSource from '../models/OrganSource';

/**
 * Parses the organ ID from the request parameters to
 * an `Organ` object and stores it in `res.locals.organ`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const parseOid = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.organId))) {
    res.send({ 'success': false, 'msg': 'bad organId' });
    return;
  }
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'organ not found' });
    return;
  }
  res.locals.organ = organ;
  next();
}

/**
 * Creates a new organ. No body is required.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.create();
  if (!organ) res.send({ 'success': false, 'msg': 'failed to create' });
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

/**
 * Gets the sources of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const getSources = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const sources = await organ.sources();
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const addSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const source = await organ.add(req.body.url);
  res.send({ 'success': true, source, });
};

/**
 * Updates a source of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const updateSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.update(new OrganSource(parseInt(req.params.sourceId), req.body.url));
  res.send({ 'success': true });
};

/**
 * Removes a source from the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const removeSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.remove(new OrganSource(parseInt(req.params.sourceId), ''));
  res.send({ 'success': true });
};
