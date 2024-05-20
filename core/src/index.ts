import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import searchRouter from './routes/search';
import organRouter from './routes/organ';
import personRouter from './routes/person';
import organizationRouter from './routes/organization';
import roleRouter from './routes/role';
import authRouter from './routes/auth';

dotenv.config();

const app: Express = express();

if (!fs.existsSync(process.env.DATA_DIR!)) fs.mkdirSync(process.env.DATA_DIR!);

passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  algorithms: ['HS256'],
}, (payload, done) => {
  return done(null, payload);
}));

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.use('/api/search/', searchRouter);
app.use('/api/organ/', organRouter);
app.use('/api/person/', personRouter);
app.use('/api/organization/', organizationRouter);
app.use('/api/role/', roleRouter);
app.use('/api/auth/', authRouter);

app.use('/api/*', (req: Request, res: Response) => {
  res.status(404);
  res.send({ 'success': false, 'msg': 'not found', });
});

app.listen(parseInt(process.env.PORT!), process.env.HOST!, () => console.log(`[*] API listening on http://${process.env.HOST}:${process.env.PORT} ... `));
