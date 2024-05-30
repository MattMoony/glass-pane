/**
 * @module controllers/organ/biopic
 * @desc Provides controllers for organ biopic management.
 * @requires express
 */

import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';

import Organ from '../../models/Organ';


/**
 * Gets the bio picture of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 * @deprecated Use the media endpoint instead.
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const organ = res.locals.organ as Organ;
  const uuid = req.params.uuid;
  if (!uuid.match(/^[\-0-9a-fA-F]{36}$/)) {
    res.send({ 'success': false, 'msg': 'bad uuid' });
    return;
  }
  if (!fs.existsSync(`${process.env.DATA_DIR}/images/${uuid}.jpg`)) {
    res.send({ 'success': false, msg: 'picture doesn\'t exist' });
    return;
  }
  res.sendFile(`${process.env.DATA_DIR}/images/${uuid}.jpg`);
};

/**
 * Uploads picture for the bio of the target organ.
 * @param req The request object.
 * @param res The response object (with `res.locals.organ`).
 * @deprecated Use the media endpoint instead.
 */
export const upload = async (req: Request, res: Response): Promise<void> => {
  // const organ = res.locals.organ as Organ;
  // const uuid = randomUUID();
  // if (!req.files || !req.files.pic) {
  //   res.send({ 'success': false, 'msg': 'missing parameters' });
  //   return;
  // }
  // const pic = req.files.pic as fileUpload.UploadedFile;
  // if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
  //   res.send({ 'success': false, 'msg': 'bad mimetype' });
  //   return;
  // }
  // await pic.mv(`${process.env.DATA_DIR}/images/${uuid}.jpg`);
  // res.send({ 'success': true, url: `/organ/${organ.id}/biopic/${uuid}`, });
  res.send({ 'success': false, 'msg': 'deprecated' });
};
