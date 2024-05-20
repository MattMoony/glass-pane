import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';

/**
 * Checks the status of the current user.
 * @param req The request object.
 * @param res The response object.
 */
export const status = async (req: Request, res: Response) => {
  res.send({ 'success': true, 'user': (req.user! as User).json(), });
};

/**
 * Logs a user in.
 * @param req The request object.
 * @param res The response object.
 */
export const login = async (req: Request, res: Response) => {
  const user = await User.get(req.body.username);
  if (!user) return res.send({ 'success': false, 'msg': 'invalid username or password' });
  const auth = await user.auth(req.body.password);
  if (!auth) return res.send({ 'success': false, 'msg': 'invalid username or password' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
  res.send({ 'success': true, 'user': { ...user.json(), token, }, });
};
