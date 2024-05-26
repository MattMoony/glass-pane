import 'process';
import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

import Person from '../models/Person';
import Relation from '../models/Relation';
import RelationSource from '../models/RelationSource';
import RelationType from '../models/RelationshipType';

/**
 * Parses the user ID from the request parameters to
 * a `Person` object and stores it in `res.locals.person`.
 * @param req The request object.
 * @param res The response object.
 */
export const parsePid = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (isNaN(parseInt(req.params.pid))) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  const person = await Person.get(parseInt(req.params.pid));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'person not found' });
    return;
  }
  res.locals.person = person;
  next();
}

/**
 * Searches for people.
 * @param req The request object.
 * @param res The response object.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  const people = await Person.find(req.query.q as string);
  res.send({ 'success': true, 'people': people.map(person => person.json()), });
};

/**
 * Creates a new person.
 * @param req The request object.
 * @param res The response object.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const birthdate = req.body.birthdate ? new Date(req.body.birthdate) : undefined;
  const deathdate = req.body.deathdate ? new Date(req.body.deathdate) : undefined;
  const person = await Person.create(req.body.firstname, req.body.lastname, birthdate, deathdate, req.body.bio);
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

  if (!(req.body.type in RelationType)) {
    res.send({ 'success': false, 'msg': 'bad type' });
    return;
  }

  const relative = await Person.get(req.body.other);
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relation = await Relation.create(req.body.type, person, relative, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  if (relation == null) {
    res.send({ 'success': false, 'msg': 'couldn\'t create relation' });
    return;
  }
  res.send({ 'success': true, 'relation': relation.json() });
};

/**
 * Updates a relation of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const updateRelation = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relation = await Relation.get(+req.params.rid);
  if (!relation) {
    res.send({ 'success': false, 'msg': 'relation not found' });
    return;
  }

  if (req.body.since !== undefined) relation.since = req.body.since ? new Date(req.body.since) : null;
  if (req.body.until !== undefined) relation.until = req.body.until ? new Date(req.body.until) : null;

  await relation.update();
  res.send({ 'success': true, 'relation': relation.json() });
}

/**
 * Removes a relation from the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const removeRelation = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relation = await Relation.get(+req.params.rid);
  if (!relation) {
    res.send({ 'success': false, 'msg': 'relation not found' });
    return;
  }

  await relation.remove();
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
  // const parents = await Relation.getAll(person, RelationType.PARENT);
  res.send({ 'success': true, 'parents': parents.map((p) => p.json(person)) });
};

/**
 * Gets the children of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getChildren = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const children = await person.getChildren();
  // const children = await Relation.getAll(person, RelationType.CHILD);
  res.send({ 'success': true, 'children': children.map((p) => p.json(person)) });
};

/**
 * Gets the romantic partners of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getRomantic = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const romantic = await person.getRomantic();
  // const romantic = await Relation.getAll(person, RelationType.ROMANTIC);
  res.send({ 'success': true, 'romantic': romantic.map((p) => p.json(person)) });
};

/**
 * Gets the friends of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getFriends = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const friends = await person.getFriends();
  // const friends = await Relation.getAll(person, RelationType.FRIEND);
  res.send({ 'success': true, 'friends': friends.map((p) => p.json(person)) });
};

/**
 * Gets the sources of the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const getRelationSources = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relative = await Person.get(parseInt(req.query.other as string));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const sources = await Relation.sources(person, relative, new Date(req.query.since as string));
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const addRelationSource = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relative = await Person.get(parseInt(req.body.other));
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
  const source = new RelationSource(parseInt(req.params.sid), req.body.url);
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
  const source = new RelationSource(parseInt(req.params.sid), '');
  await source.remove();
  res.send({ 'success': true });
};
