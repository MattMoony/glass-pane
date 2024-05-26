import { Request, Response } from 'express';

import Organization from '../models/Organization';
import Membership from '../models/Membership';

/**
 * Parses the organization ID from the request parameters to
 * an `Organization` object and stores it in `res.locals.organization`.
 * @param req The request object.
 * @param res The response object.
 */
export const parseOid = async (req: Request, res: Response, next: Function): Promise<void> => {
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

/**
 * Searches for organizations.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const organizations = await Organization.find(req.query.q as string);
  res.send({ 'success': true, 'organizations': organizations.map(organization => organization.json()), });
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
  const established = req.body.established ? new Date(req.body.established) : undefined;
  const dissolved = req.body.dissolved ? new Date(req.body.dissolved) : undefined;
  const organization = await Organization.create(req.body.name, req.body.bio||'', established, dissolved);
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
 
  if (req.body.bio) organization.bio = req.body.bio;
  if (req.body.name) organization.name = req.body.name;
  if (req.body.established) organization.established = new Date(req.body.established);
  if (req.body.dissolved) organization.dissolved = new Date(req.body.dissolved);
 
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

/**
 * Gets the members of an organization.
 * @param req The request object.
 * @param res The response object (with `res.locals.organization`).
 */
export const getMembers = async (req: Request, res: Response): Promise<void> => {
  const organization = res.locals.organization as Organization;
  // const members = await Membership.get(organization);
  const members = await organization.getMembers();
  res.send({ 'success': true, 'members': members.map(member => ({ ...member.json(), organization: undefined, })), });
}
