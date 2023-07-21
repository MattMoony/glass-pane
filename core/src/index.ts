import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import personRouter from './routes/person';

dotenv.config();

const app: Express = express();

app.use('/person/', personRouter);

app.use('*', (req: Request, res: Response) => {
  res.status(404);
  res.send({ 'success': false, 'msg': 'not found', });
});

app.listen(parseInt(process.env.PORT!), process.env.HOST!, () => console.log(`[*] API listening on http://${process.env.HOST}:${process.env.PORT} ... `));
