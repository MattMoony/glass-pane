import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';

import { CheckTemplate } from '../middleware';


/**
 * The required query formats for the endpoints defined here.
 */
export const QUERIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * The required body formats for the endpoints defined here.
 */
export const BODIES: {
  [name: string]: CheckTemplate,
} = {};

/**
 * Checks the status of the current user.
 * @param req The request object.
 * @param res The response object.
 */
export const status = async (req: Request, res: Response) => {
  res.send({ 'success': true, 'user': (req.user! as User).json(), });
};

/**
 * The required body format for the login endpoint.
 */
BODIES.LOGIN = { 
  username: { type: 'string', }, 
  password: { type: 'string', }, 
};

/**
 * Logs a user in.
 * @param req The request object.
 * @param res The response object.
 */
export const login = async (req: Request, res: Response) => {
  const user = await User.get(req.body.username);
  if (!user) 
    return res.send({ 'success': false, 'msg': 'invalid username or password' });
  const auth = await user.auth(req.body.password);
  if (!auth) 
    return res.send({ 'success': false, 'msg': 'invalid username or password' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d', });
  res.cookie('gptkn', token, { httpOnly: true, sameSite: 'strict', });
  res.send({ 'success': true, 'user': { ...user.json(), }, });
};
