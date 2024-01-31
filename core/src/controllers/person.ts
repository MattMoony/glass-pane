import 'process';
import { Request, Response } from 'express';

import Person, { Relation } from '../models/Person';

export const checkUid = (req: Request, res: Response, next: () => void): void => {
  if (isNaN(parseInt(req.params.userId))) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }

  next();
}

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
  if (req.body.birthdate) person.birthdate = new Date(req.body.birthdate);
  if (req.body.deathdate) person.deathdate = new Date(req.body.deathdate);

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

export const getParents = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const parents = await person.getParents();
  res.send({ 'success': true, 'parents': parents.map((p) => p.json(true)) });
};

export const getChildren = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const children = await person.getChildren();
  res.send({ 'success': true, 'children': children.map((p) => p.json(true)) });
};

export const getRomantic = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const romantic = await person.getRomantic();
  res.send({ 'success': true, 'romantic': romantic.map((p) => p.json(true)) });
};

export const getFriends = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const friends = await person.getFriends();
  res.send({ 'success': true, 'friends': friends.map((p) => p.json(true)) });
};

export const getRelationSource = async (req: Request, res: Response): Promise<void> => {
  if (!req.query.from || !req.query.to || !req.query.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const person = await Person.get(parseInt(req.query.from));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const relative = await Person.get(parseInt(req.query.to));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  const source = await Relation.getSource(person, relative, new Date(req.query.since));
  res.send({ 'success': true, 'source': source });
}
