/**
 * @module controllers/organ/memberships
 * @desc Provides controllers for organ memberships.
 * @requires express
 */

import { Request, Response } from 'express';

import Organ from '../../../models/Organ';
import Organization from '../../../models/Organization';
import Membership from '../../../models/Membership';
import Role from '../../../models/Role';

export * as sources from './sources';


/**
 * Gets the memberships of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  // const memberships = await Membership.get(organ);
  const memberships = await organ.getMemberships();
  res.send({ 'success': true, 'memberships': memberships.map(m => ({ ...m.json(), organ: undefined, })) });
};

/**
 * Adds a membership to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const organization = await Organization.get(parseInt(req.body.organization));
  if (!organization) {
    res.send({ 'success': false, 'msg': 'unknown organization' });
    return;
  }
  const role = await Role.get(parseInt(req.body.role));
  if (!role) {
    res.send({ 'success': false, 'msg': 'unknown role' });
    return;
  }
  const since = req.body.since ? new Date(req.body.since) : undefined;
  const until = req.body.until ? new Date(req.body.until) : undefined;
  const sources = req.body.sources as string[];
  try {
    // const membership = await Membership.create(sources, organ, organization, role, since, until);
    const membership = await organ.addMembership(sources, organization, role, since, until);
    res.send({ 'success': true, membership, });
  } catch {
    res.send({ 'success': false, 'msg': 'membership already exists', });
  }
};

/**
 * Updates a membership of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const membership = await Membership.get(parseInt(req.params.mid));
  if (!membership) {
    res.send({ 'success': false, 'msg': 'membership doesn\'t exist' });
    return;
  }
  if (req.body.role) {
    const role = await Role.get(parseInt(req.body.role));
    if (role) membership.role = role;
  }
  if (req.body.since !== undefined) membership.since = req.body.since ? new Date(req.body.since) : null;
  if (req.body.until !== undefined) membership.until = req.body.until ? new Date(req.body.until) : null;
  // await membership.update();
  await organ.updateMembership(membership);
  res.send({ 'success': true });
};

/**
 * Removes a membership from the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const membership = await Membership.get(parseInt(req.params.mid));
  if (!membership) {
    res.send({ 'success': false, 'msg': 'membership doesn\'t exist' });
    return;
  }
  // await membership.remove();
  await organ.removeMembership(membership);
  res.send({ 'success': true });
};
