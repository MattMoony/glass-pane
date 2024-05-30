/**
 * @module middleware/role
 * @desc Provides middleware for role management.
 * @requires express
 */

import { Request, Response } from 'express';

import Role from '../models/Role';

/**
 * Parses the role ID from the request parameters to
 * a `Role` object and stores it in `res.locals.role`.
 * @param req The request object.
 * @param res The response object.
 */
export const rid2role = async (req: Request, res: Response, next: Function): Promise<void> => {
  if (isNaN(parseInt(req.params.rid))) {
    res.send({ 'success': false, 'msg': 'bad roleid' });
    return;
  }
  const role = await Role.get(parseInt(req.params.rid));
  if (role === null) {
    res.send({ 'success': false, 'msg': 'role not found' });
    return;
  }
  res.locals.role = role;
  next();
}
