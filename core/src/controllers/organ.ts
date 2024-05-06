import 'process';
import { Request, Response } from 'express';

import Organ from '../models/Organ';

export const checkOid = (req: Request, res: Response, next: () => void): void => {
  if (isNaN(parseInt(req.params.organId))) {
    res.send({ 'success': false, 'msg': 'bad organId' });
    return;
  }

  next();
}

export const create = async (req: Request, res: Response): Promise<void> => {
  const id = await Organ.create();
  if (!id) res.send({ 'success': false, 'msg': 'failed to create' });
  res.send({ 'success': true, id });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  res.send({ 'success': true, 'organ': organ });
};

export const getSources = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  const sources = await organ.getSources();
  res.send({ 'success': true, 'sources': sources });
};

export const addSource = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  const sid = await organ.addSource(req.body.url);
  res.send({ 'success': true, id: sid, });
};

export const updateSource = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  await organ.updateSource(parseInt(req.params.sourceId), req.body.url);
  res.send({ 'success': true });
};

export const removeSource = async (req: Request, res: Response): Promise<void> => {
  const organ = await Organ.get(parseInt(req.params.organId));
  if (organ === null) {
    res.send({ 'success': false, 'msg': 'not found' });
    return;
  }
  await organ.removeSource(parseInt(req.params.sourceId));
  res.send({ 'success': true });
};