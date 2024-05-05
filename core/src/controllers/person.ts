import 'process';
import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

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

export const getName = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  res.send({ 'success': true, 'firstname': person.firstname, 'lastname': person.lastname, });
};

export const getPic = async (req: Request, res: Response): Promise<void> => {
  if (!req.params.userId.match(/^[0-9]+$/)) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  if (fs.existsSync(`${process.env.DATA_DIR}/${req.params.userId}.jpg`)) {
    res.sendFile(`${process.env.DATA_DIR}/${req.params.userId}.jpg`);
  }
  else {
    res.sendFile(`${process.env.DATA_DIR}/default.png`);
  }
};

export const setPic = async (req: Request, res: Response): Promise<void> => {
  if (!req.params.userId.match(/^[0-9]+$/)) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  if (!req.files || !req.files.pic) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const pic = req.files.pic as fileUpload.UploadedFile;
  if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
    res.send({ 'success': false, 'msg': 'bad mimetype' });
    return;
  }
  await pic.mv(`${process.env.DATA_DIR}/${req.params.userId}.jpg`);
  res.send({ 'success': true });
};

export const removePic = async (req: Request, res: Response): Promise<void> => {
  if (!req.params.userId.match(/^[0-9]+$/)) {
    res.send({ 'success': false, 'msg': 'bad userid' });
    return;
  }
  if (fs.existsSync(`${process.env.DATA_DIR}/${req.params.userId}.jpg`)) {
    fs.unlinkSync(`${process.env.DATA_DIR}/${req.params.userId}.jpg`);
  }
  res.send({ 'success': true });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  if (req.body.bio) person.bio = req.body.bio;
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

export const updateRelation = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  if (!req.body.personId || !req.body.type || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  await person.updateRelation(req.body.type, relative, req.body.source, new Date(req.body.since), req.body.until ? new Date(req.body.until) : undefined);
  res.send({ 'success': true });
}

export const removeRelation = async (req: Request, res: Response): Promise<void> => {
  const person = await Person.get(parseInt(req.params.userId));
  if (person === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  if (!req.body.personId || !req.body.type || !req.body.since) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }

  const relative = await Person.get(parseInt(req.body.personId));
  if (relative === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }

  await person.removeRelation(req.body.type, relative, new Date(req.body.since));
  res.send({ 'success': true });
}

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
