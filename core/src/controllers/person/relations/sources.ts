/**
 * @module controllers/person/relations/sources
 * @desc Provides controllers for person relation source management.
 * @requires express
 */

import { Request, Response } from 'express';

import Person from '../../../models/Person';
import Relation from '../../../models/Relation';
import RelationSource from '../../../models/RelationSource';

/**
 * Gets the sources of the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;

  const sources = await Relation.sources(parseInt(req.params.rid));
  res.send({ 'success': true, 'sources': sources });
};

/**
 * Adds a source to the relation between the target person and another person.
 * @param req The request object.
 * @param res The response object (with `res.locals.person`).
 */
export const add = async (req: Request, res: Response): Promise<void> => {
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
export const update = async (req: Request, res: Response): Promise<void> => {
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
export const remove = async (req: Request, res: Response): Promise<void> => {
  const person = res.locals.person as Person;
  const source = new RelationSource(parseInt(req.params.sid), '');
  await source.remove();
  res.send({ 'success': true });
};
