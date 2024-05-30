/**
 * @module middleware/organization
 * @desc Provides middleware for organization management.
 * @requires express
 */

import { Request, Response } from 'express';

import Organization from '../models/Organization';

/**
 * Parses the organization ID from the request parameters to
 * an `Organization` object and stores it in `res.locals.organization`.
 * @param req The request object.
 * @param res The response object.
 */
export const oid2organization = async (req: Request, res: Response, next: Function): Promise<void> => {
  if (isNaN(parseInt(req.params.oid))) {
    res.send({ 'success': false, 'msg': 'bad organizationid', });
    return;
  }
  const organization = await Organization.get(parseInt(req.params.oid));
  if (!organization) {
    res.send({ 'success': false, 'msg': 'organization not found', });
    return;
  }
  res.locals.organization = organization;
  next();
};
