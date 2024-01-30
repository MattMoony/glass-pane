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
