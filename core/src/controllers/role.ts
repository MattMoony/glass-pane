import { Request, Response } from 'express';

import Role from '../models/Role';

/**
 * Parses the role ID from the request parameters to
 * a `Role` object and stores it in `res.locals.role`.
 * @param req The request object.
 * @param res The response object.
 */
export const parseRid = async (req: Request, res: Response, next: Function): Promise<void> => {
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

/**
 * Searches for roles.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const roles = await Role.find(req.query.q as string);
  res.send({ 'success': true, 'roles': roles.map(role => role.json()), });
}

/**
 * Creates a role.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const role = await Role.create(req.body.name);
  res.send({ 'success': true, 'role': role.json(), });
};

/**
 * Gets a role.
 * @param req The request object.
 * @param res The response object (with `res.locals.role`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const role = res.locals.role as Role;
  if (!role) {
    res.send({ 'success': false, 'msg': 'role not found', });
    return;
  }
  res.send({ 'success': true, 'role': role.json(), });
};

/**
 * Updates a role.
 * @param req The request object.
 * @param res The response object (with `res.locals.role`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const role = res.locals.role as Role;
  if (req.body.name) role.name = req.body.name;
  await role.update();
  res.send({ 'success': true, 'role': role.json(), });
};

/**
 * Removes a role.
 * @param req The request object.
 * @param res The response object (with `res.locals.role`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const role = res.locals.role as Role;
  await role.delete();
  res.send({ 'success': true, });
};
