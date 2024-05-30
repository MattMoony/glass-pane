/**
 * @module controllers/organ/memberships/sources
 * @desc Provides controllers for organ membership sources.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../../../models/Organ';
import Membership from '../../../models/Membership';


/**
 * Gets the sources of a membership of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const sources = await Membership.sources(parseInt(req.params.mid));
  res.send({ 'success': true, 'sources': sources });
}
