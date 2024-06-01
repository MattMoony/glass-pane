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

import { CheckTemplate } from '../../../middleware';

export * as sources from './sources';


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
 * Gets the memberships of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  // const memberships = await Membership.get(organ);
  const memberships = await organ.memberships();
  res.send({ 'success': true, 'memberships': memberships.map(m => ({ ...m.json(), organ: undefined, })) });
};

/**
 * The required body format for the add endpoint.
 */
BODIES.ADD = {
  sources: { type: 'array', items: 'string', },
  organization: { type: 'number', },
  role: { type: 'number', },
  since: { type: 'string', optional: true, nullable: true, },
  until: { type: 'string', optional: true, nullable: true, },
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
    const membership = await organ.add(role, organization, sources, since, until);
    res.send({ 'success': true, membership, });
  } catch {
    res.send({ 'success': false, 'msg': 'membership already exists', });
  }
};

/**
 * The required body format for the update endpoint.
 */
BODIES.UPDATE = {
  role: { type: 'number', optional: true, },
  since: { type: 'string', optional: true, nullable: true, },
  until: { type: 'string', optional: true, nullable: true, },
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
  await organ.update(membership);
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
  await organ.remove(membership);
  res.send({ 'success': true });
};
