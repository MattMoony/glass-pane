/**
 * @module controllers/person/relations
 * @desc Provides controllers for person relation management.
 * @requires express
 */

import { Request, Response } from 'express';

import Person from '../../../models/Person';
import Relation from '../../../models/Relation';
import RelationType from '../../../models/RelationshipType';

export * as sources from './sources';

/**
 * Adds a relation to the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
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

  const relation = await person.addRelation(
    req.body.sources||[], 
    req.body.type, 
    relative, 
    req.body.since ? new Date(req.body.since) : undefined, 
    req.body.until ? new Date(req.body.until) : undefined
  );
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
export const update = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relation = await Relation.get(+req.params.rid);
  if (!relation) {
    res.send({ 'success': false, 'msg': 'relation not found' });
    return;
  }

  if (req.body.since !== undefined) relation.since = req.body.since ? new Date(req.body.since) : null;
  if (req.body.until !== undefined) relation.until = req.body.until ? new Date(req.body.until) : null;

  await person.updateRelation(relation);
  res.send({ 'success': true, 'relation': relation.json() });
}

/**
 * Removes a relation from the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const relation = await Relation.get(+req.params.rid);
  if (!relation) {
    res.send({ 'success': false, 'msg': 'relation not found' });
    return;
  }

  await person.removeRelation(relation);
  res.send({ 'success': true });
}

/**
 * Gets the parents of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const parents = async (req: Request, res: Response): Promise<void> => {
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
export const children = async (req: Request, res: Response): Promise<void> => {
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
export const romantic = async (req: Request, res: Response): Promise<void> => {
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
export const friends = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const friends = await person.getFriends();
  // const friends = await Relation.getAll(person, RelationType.FRIEND);
  res.send({ 'success': true, 'friends': friends.map((p) => p.json(person)) });
};
