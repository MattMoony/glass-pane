import 'process';
import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

import Organ from '../models/Organ';
import OrganSource from '../models/OrganSource';
import Membership from '../models/Membership';
import Role from '../models/Role';
import Organization from '../models/Organization';
import Person from '../models/Person';

/**
 * Parses the organ ID from the request parameters to
 * an `Organ` object and stores it in `res.locals.organ`.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns Nothing.
 */
export const parseOid = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.oid))) {
    res.send({ 'success': false, 'msg': 'bad organId' });
    return;
  }
  const organ = await Organ.get(parseInt(req.params.oid));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'organ not found' });
    return;
  }
  res.locals.organ = organ;
  next();
}

/**
 * Searches for organs.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.q as string).trim().toLowerCase();
  const people = await Person.find(query);
  const organizations = await Organization.find(query);
  res.send({ 'success': true, people, organizations, });
};

/**
 * Creates a new organ. No body is required.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.create(req.body.bio);
  if (!organ) res.send({ 'success': false, 'msg': 'failed to create' });
  res.send({ 'success': true, organ });
};

/**
 * Gets the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  res.send({ 'success': true, 'organ': res.locals.organ as Organ });
};

/**
 * Gets the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const getPic = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (fs.existsSync(`${process.env.DATA_DIR}/${organ.id}.jpg`))
    res.sendFile(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  else {
    const person = await Person.get(organ.id);
    if (person) res.sendFile(`${process.env.DATA_DIR}/default-person.webp`);
    else res.sendFile(`${process.env.DATA_DIR}/default-organization.webp`);
  }
};

/**
 * Sets the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const setPic = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (!req.files || !req.files.pic) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const pic = req.files.pic as fileUpload.UploadedFile;
  if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
    res.send({ 'success': false, 'msg': 'bad mimetype' });
    return;
  }
  await pic.mv(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  res.send({ 'success': true });
};

/**
 * Removes the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const removePic = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (fs.existsSync(`${process.env.DATA_DIR}/${organ.id}.jpg`))
    fs.unlinkSync(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  res.send({ 'success': true });
};

/**
 * Gets the sources of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const getSources = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const sources = await organ.sources();
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const addSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const source = await organ.add(req.body.url);
  res.send({ 'success': true, source, });
};

/**
 * Updates a source of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const updateSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.update(new OrganSource(parseInt(req.params.sid), req.body.url));
  res.send({ 'success': true });
};

/**
 * Removes a source from the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const removeSource = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  await organ.remove(new OrganSource(parseInt(req.params.sid), ''));
  res.send({ 'success': true });
};

/**
 * Gets the memberships of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const getMemberships = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const memberships = await Membership.get(organ);
  res.send({ 'success': true, 'memberships': memberships.map(m => ({ ...m.json(), organ: undefined, })) });
};

/**
 * Adds a membership to the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const addMembership = async (req: Request, res: Response): Promise<void> => {
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
  const since = new Date(req.body.since);
  const until = req.body.until ? new Date(req.body.until) : undefined;
  const sources = req.body.sources as string[];
  try {
    const membership = await Membership.create(sources, organ, organization, role, since, until);
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
export const updateMembership = async (req: Request, res: Response): Promise<void> => {
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
  const since = new Date(req.body.since);
  const until = req.body.until ? new Date(req.body.until) : undefined;
  const membership = await Membership.get(organ, organization, role, since);
  if (!membership) {
    res.send({ 'success': false, 'msg': 'membership doesn\'t exist', });
    return;
  }
  try {
    await membership.update();
    res.send({ 'success': true });
  } catch {
    res.send({ 'success': false, 'msg': 'membership doesn\'t exist', });
  }
};

/**
 * Removes a membership from the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const removeMembership = async (req: Request, res: Response): Promise<void> => {
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
  const since = new Date(req.body.since);
  try {
    const membership = await Membership.get(organ, organization, role, since);
    if (!membership) {
      res.send({ 'success': false, 'msg': 'membership doesn\'t exist', });
      return;
    }
    await membership.remove();
    res.send({ 'success': true });
  } catch {
    res.send({ 'success': false, 'msg': 'membership doesn\'t exist', });
  }
};
