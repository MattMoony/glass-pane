import 'process';
import { Request, Response } from 'express';

import Person from '../models/Person';

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.firstname || !req.body.lastname) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const person = await Person.create(req.body.firstname, req.body.lastname, req.body.birthdate, req.body.deathdate);
  res.send({ 'success': true, 'person': person.json() });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  res.send({ 'success': true, 'person': person.json() });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  if (req.body.firstname) person.firstname = req.body.firstname;
  if (req.body.lastname) person.lastname = req.body.lastname;
  if (req.body.birthdate) person.birthdate = req.body.birthdate;
  if (req.body.deathdate) person.deathdate = req.body.deathdate;

  await person.update();
  res.send({ 'success': true, 'person': person.json() });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  await person.remove();
  res.send({ 'success': true });
};

export const addRelation = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  if (!req.body.type || !req.body.personId || !req.body.source || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  await person.addRelation(req.body.type, relative, req.body.source, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  res.send({ 'success': true });
};
