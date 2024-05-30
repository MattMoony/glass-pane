/**
 * @module controllers/organ/pic
 * @desc Provides controllers for organ profile pictures.
 * @requires express
 */

import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

import Organ from '../../models/Organ';
import Person from '../../models/Person';

/**
 * Gets the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (fs.existsSync(`${process.env.DATA_DIR}/${organ.id}.jpg`))
    res.sendFile(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  else {
    const person = await Person.get(organ.id);
    if (person) 
      res.sendFile(`${process.env.DATA_DIR}/default-person.webp`);
    else 
      res.sendFile(`${process.env.DATA_DIR}/default-organization.webp`);
  }
};

/**
 * Sets the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const set = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (!req.files || !req.files.pic) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const pic = req.files.pic as fileUpload.UploadedFile;
  if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
    res.send({ 'success': false, 'msg': 'bad mimetype' });
    return;
  }
  await pic.mv(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  res.send({ 'success': true });
};

/**
 * Removes the profile picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  if (fs.existsSync(`${process.env.DATA_DIR}/${organ.id}.jpg`))
    fs.unlinkSync(`${process.env.DATA_DIR}/${organ.id}.jpg`);
  res.send({ 'success': true });
};
