import { Request, Response } from 'express';
import passport from 'passport';

import User from '../models/user';

export const requireAuth = (req: Request, res: Response, next: Function) => {
  passport.authenticate('jwt', { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      res.send({ 'success': false, 'msg': 'unauthorized', });
      return;
    }
    const gpUser = await User.get(user.id);
    if (!gpUser) return res.send({ 'success': false, 'msg': 'unauthorized' });
    req.user = gpUser;
    next();
  })(req, res, next);
};