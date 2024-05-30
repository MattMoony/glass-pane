/**
 * @module controllers/organ/socials
 * @desc Provides controllers for organ socials.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../../models/Organ';
import Socials from '../../models/Socials';

/**
 * Gets the social media accounts of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const socials = await organ.socials();
  res.send({ 'success': true, 'socials': socials });
};

/**
 * Adds a social media account to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const platform = parseInt(req.body.platform);
  const url = req.body.url;
  const social = await organ.add(platform, url);
  res.send({ 'success': true, social });
};

/**
 * Updates a social media account of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const social = await Socials.get(parseInt(req.params.sid));
  if (!social) {
    res.send({ 'success': false, 'msg': 'social not found' });
    return;
  }
  social.url = req.body.url;
  await social.update();
  res.send({ 'success': true });
};

/**
 * Removes a social media account from the target organ.
 * @param req The request object.
 * @param res The response object.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const social = await Socials.get(parseInt(req.params.sid));
  if (!social) {
    res.send({ 'success': false, 'msg': 'social not found' });
    return;
  }
  await social.remove();
  res.send({ 'success': true });
};
