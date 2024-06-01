/**
 * @module controllers/person/relations
 * @desc Provides controllers for person relation management.
 * @requires express
 */

import { Request, Response } from 'express';

import Person from '../../../models/Person';
import Relation from '../../../models/Relation';
import RelationType from '../../../models/RelationshipType';

import { CheckTemplate } from '../../../middleware';

export * as sources from './sources';


/**
 * The required query formats for the endpoints defined here.
 */
export const QUERIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * The required body formats for the endpoints defined here.
 */
export const BODIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * The required body format for the add endpoint.
 */
BODIES.ADD = {
  type: { type: 'number', },
  other: { type: 'number', },
  sources: { type: 'array', items: 'string', },
  since: { type: 'string', optional: true, nullable: true, },
  until: { type: 'string', optional: true, nullable: true, },
};

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

  const relation = await person.add(
    relative, 
    req.body.type, 
    req.body.sources||[], 
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
 * The required body format for the update endpoint.
 */
BODIES.UPDATE = {
  since: { type: 'string', optional: true, nullable: true, },
  until: { type: 'string', optional: true, nullable: true, },
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

  await person.update(relation);
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

  await person.remove(relation);
  res.send({ 'success': true });
}

/**
 * Gets the parents of the target person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const parents = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const parents = await person.parents();
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
  const children = await person.children();
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
  const romantic = await person.romantic();
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
  const friends = await person.friends();
  // const friends = await Relation.getAll(person, RelationType.FRIEND);
  res.send({ 'success': true, 'friends': friends.map((p) => p.json(person)) });
};
