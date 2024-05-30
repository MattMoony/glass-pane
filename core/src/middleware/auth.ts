/**
 * @module middleware/auth
 * @desc Provides authentication middleware.
 * @requires express
 */

import { Request, Response } from 'express';
import passport from 'passport';

import User from '../models/User';

export const requireAuth = (req: Request, res: Response, next: Function) => {
  passport.authenticate('jwt', { session: false }, async (err: any, token: any) => {
    if (err || !token) {
      res.send({ 'success': false, 'msg': 'unauthorized', });
      return;
    }
    const user = await User.get(token.id);
    if (!user) return res.send({ 'success': false, 'msg': 'unauthorized' });
    req.user = user;
    next();
  })(req, res, next);
};