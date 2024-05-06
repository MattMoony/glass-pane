import 'process';
import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

import Person, { Relation, RelationSource } from '../models/Person';
import RelationType from '../models/RelationshipType';

/**
 * Parses the user ID from the request parameters to
 * a `Person` object and stores it in `res.locals.person`.
 * @param req The request object.
 * @param res The response object.
 */
export const parseUid = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.userId))) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'person not found' });
    return;
  }
  res.locals.person = person;
  next();
}

/**
 * Creates a new person.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.firstname || !req.body.lastname) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const person = await Person.create(req.body.firstname, req.body.lastname, req.body.birthdate, req.body.deathdate);
  res.send({ 'success': true, 'person': person.json() });
};

/**
 * Gets the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  res.send({ 'success': true, 'person': person.json() });
};

/**
 * Gets the name of the target person.
 * @deprecated Use `get` instead.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getName = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  res.send({ 'success': true, 'firstname': person.firstname, 'lastname': person.lastname, });
};

/**
 * Gets the profile picture of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getPic = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  if (fs.existsSync(`${process.env.DATA_DIR}/${person.id}.jpg`))
    res.sendFile(`${process.env.DATA_DIR}/${person.id}.jpg`);
  else
    res.sendFile(`${process.env.DATA_DIR}/default.png`);
};

/**
 * Sets the profile picture of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const setPic = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  if (!req.files || !req.files.pic) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const pic = req.files.pic as fileUpload.UploadedFile;
  if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
    res.send({ 'success': false, 'msg': 'bad mimetype' });
    return;
  }
  await pic.mv(`${process.env.DATA_DIR}/${person.id}.jpg`);
  res.send({ 'success': true });
};

/**
 * Removes the profile picture of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const removePic = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  if (fs.existsSync(`${process.env.DATA_DIR}/${person.id}.jpg`))
    fs.unlinkSync(`${process.env.DATA_DIR}/${person.id}.jpg`);
  res.send({ 'success': true });
};

/**
 * Updates the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (req.body.bio) person.bio = req.body.bio;
  if (req.body.firstname) person.firstname = req.body.firstname;
  if (req.body.lastname) person.lastname = req.body.lastname;
  if (req.body.birthdate) person.birthdate = new Date(req.body.birthdate);
  if (req.body.deathdate) person.deathdate = new Date(req.body.deathdate);

  await person.update();
  res.send({ 'success': true, 'person': person.json() });
};

/**
 * Removes the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  await person.remove();
  res.send({ 'success': true });
};

/**
 * Adds a relation to the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const addRelation = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.body.type || !req.body.personId || !req.body.source || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  if (!(+req.body.type in RelationType)) {
    res.send({ 'success': false, 'msg': 'bad type' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relation = new Relation(+req.body.type, person, relative, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  await person.add(relation, typeof req.body.source === 'string' ? [req.body.source,] : req.body.source);
  res.send({ 'success': true });
};

/**
 * Updates a relation of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const updateRelation = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.body.personId || !req.body.type || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  if (!(+req.body.type in RelationType)) {
    res.send({ 'success': false, 'msg': 'bad type' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relation = new Relation(+req.body.type, person, relative, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  await person.update(relation);
  res.send({ 'success': true });
}

/**
 * Removes a relation from the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const removeRelation = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.body.personId || !req.body.type || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  if (!(+req.body.type in RelationType)) {
    res.send({ 'success': false, 'msg': 'bad type' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relation = new Relation(+req.body.type, person, relative, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  await person.remove(relation);
  res.send({ 'success': true });
}

/**
 * Gets the parents of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getParents = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const parents = await person.getParents();
  res.send({ 'success': true, 'parents': parents.map((p) => p.json(true)) });
};

/**
 * Gets the children of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getChildren = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const children = await person.getChildren();
  res.send({ 'success': true, 'children': children.map((p) => p.json(true)) });
};

/**
 * Gets the romantic partners of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getRomantic = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const romantic = await person.getRomantic();
  res.send({ 'success': true, 'romantic': romantic.map((p) => p.json(true)) });
};

/**
 * Gets the friends of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getFriends = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const friends = await person.getFriends();
  res.send({ 'success': true, 'friends': friends.map((p) => p.json(true)) });
};

/**
 * Gets the sources of the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getRelationSources = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.query.to || typeof req.query.to !== 'string' || !req.query.since || typeof req.query.since !== 'string') {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const relative = await Person.get(parseInt(req.query.to));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const sources = await Relation.sources(person, relative, new Date(req.query.since));
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const addRelationSource = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.body.to || !req.body.since || !req.body.url) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.to));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relation = await Relation.get(person, relative, new Date(req.body.since));
  if (!relation) {
    res.send({ 'success': false, 'msg': 'no relation' });
    return;
  }
  
  const source = await relation.add(req.body.url);
  res.send({ 'success': true, source, });
};

/**
 * Updates a source of the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const updateRelationSource = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.params.sourceId || !req.body.url) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const source = new RelationSource(parseInt(req.params.sourceId), req.body.url);
  await source.update();
  res.send({ 'success': true, });
};

/**
 * Removes a source from the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const removeRelationSource = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  if (!req.params.sourceId) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const source = new RelationSource(parseInt(req.params.sourceId), '');
  await source.remove();
  res.send({ 'success': true });
};
