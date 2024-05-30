import { Request, Response } from 'express';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { randomUUID } from 'crypto';

/**
 * Uploads picture for use in the bio of organs, etc.
 * @param req The request object.
 * @param res The response object.
 */
export const uploadPic = async (req: Request, res: Response): Promise<void> => {
  const uuid = randomUUID();
  if (!req.files || !req.files.pic) {
    res.send({ 'success': false, 'msg': 'missing parameters' });
    return;
  }
  const pic = req.files.pic as fileUpload.UploadedFile;
  if (!['image/jpeg', 'image/png', 'image/gif',].includes(pic.mimetype)) {
    res.send({ 'success': false, 'msg': 'bad mimetype' });
    return;
  }
  await pic.mv(`${process.env.DATA_DIR}/images/${uuid}.jpg`);
  res.send({ 'success': true, url: `/media/${uuid}`, });
};

/**
 * Gets a picture.
 * @param req The request object.
 * @param res The response object.
 */
export const getPic = async (req: Request, res: Response): Promise<void> => {
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
