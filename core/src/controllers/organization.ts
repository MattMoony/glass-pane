import { Request, Response } from 'express';
import Organization from '../models/Organization';

/**
 * Parses the organization ID from the request parameters to
 * an `Organization` object and stores it in `res.locals.organization`.
 * @param req The request object.
 * @param res The response object.
 */
export const parseOid = async (req: Request, res: Response, next: Function): Promise<void> => {
  if (isNaN(parseInt(req.params.orgId))) {
    res.send({ 'success': false, 'msg': 'bad organizationid', });
    return;
  }
  const organization = await Organization.get(parseInt(req.params.orgId));
  if (!organization) {
    res.send({ 'success': false, 'msg': 'organization not found', });
    return;
  }
  res.locals.organization = organization;
  next();
};

/**
 * Creates a new organization.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.name) {
    res.send({ 'success': false, 'msg': 'missing name', });
    return;
  }
  const organization = await Organization.create(req.body.name, req.body.established, req.body.dissolved);
  res.send({ 'success': true, 'organization': organization });
};

/**
 * Gets an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  res.send({ 'success': true, 'organization': organization.json(), });
};

/**
 * Updates an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
 
  if (req.body.name) organization.name = req.body.name;
  if (req.body.established) organization.established = req.body.established;
  if (req.body.dissolved) organization.dissolved = req.body.dissolved;
 
  await organization.update();
  res.send({ 'success': true, 'organization': organization.json(), });
}

/**
 * Removes an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  await organization.remove();
  res.send({ 'success': true, });
}
