/**
 * @module controllers/organization/members
 * @desc Provides controllers for organization member management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organization from '../../models/Organization';

/**
 * Gets the members of an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  // const members = await Membership.get(organization);
  const members = await organization.members();
  res.send({ 'success': true, 'members': members.map(member => ({ ...member.json(), organization: undefined, })), });
}
