import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { pool } from './db';

import organRouter from './routes/organ';
import personRouter from './routes/person';
import organizationRouter from './routes/organization';
import roleRouter from './routes/role';
import authRouter from './routes/auth';
import locationRouter from './routes/location';
import nationRouter from './routes/nation';

dotenv.config();

const app: Express = express();

if (!fs.existsSync(process.env.DATA_DIR!)) fs.mkdirSync(process.env.DATA_DIR!);

passport.use(new Strategy({
  jwtFromRequest: (req) => req && req.cookies ? req.cookies.gptkn : null,
  secretOrKey: process.env.JWT_SECRET!,
  algorithms: ['HS256'],
}, (payload, done) => {
  return done(null, payload);
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: [ 'http://localhost:5173', 'https://watchthe.top', ], credentials: true, }));
app.use(fileUpload());

app.use('/api/organ/', organRouter);
app.use('/api/person/', personRouter);
app.use('/api/organization/', organizationRouter);
app.use('/api/role/', roleRouter);
app.use('/api/location/', locationRouter);
app.use('/api/nation/', nationRouter);
app.use('/api/auth/', authRouter);

app.get('/api/stats', async (req: Request, res: Response) => {
  const client = await pool.connect();
  const result = await client.query(`
    SELECT COUNT(*)
    FROM person
    UNION ALL
    SELECT COUNT(*)
    FROM organization
    UNION ALL
    SELECT COUNT(*)
    FROM relation
    UNION ALL
    SELECT COUNT(*)
    FROM membership;
  `);
  client.release();
  if (result.rowCount != 4) return res.send({ 'success': false, 'msg': 'failed to get stats', });
  res.send({
    'success': true,
    'stats': {
      'people': parseInt(result.rows[0].count),
      'organizations': parseInt(result.rows[1].count),
      'relations': parseInt(result.rows[2].count),
      'memberships': parseInt(result.rows[3].count),
    },
  });
});

app.use('/api/*', (req: Request, res: Response) => {
  res.status(404);
  res.send({ 'success': false, 'msg': 'not found', });
});

app.listen(parseInt(process.env.PORT!), process.env.HOST!, () => console.log(`[*] API listening on http://${process.env.HOST}:${process.env.PORT} ... `));
