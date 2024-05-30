/**
 * @module controllers/person
 * @desc Provides controllers for person management.
 * @requires express
 */

import { Request, Response } from 'express';

import Person from '../../models/Person';

export * as relations from './relations';

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
 * Gets a random person.
 * @param req The request object.
 * @param res The response object.
 */
export const random = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.random();
  if (!person) {
    res.send({ 'success': false, 'msg': 'no people' });
    return;
  }
  res.send({ 'success': true, 'person': person.json() });
}

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
