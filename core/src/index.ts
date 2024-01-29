import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import personRouter from './routes/person';

dotenv.config();

const app: Express = express();

app.use(cors())
app.use('/api/person/', personRouter);

app.use('/api/*', (req: Request, res: Response) => {
  res.status(404);
  res.send({ 'success': false, 'msg': 'not found', });
});

app.listen(parseInt(process.env.PORT!), process.env.HOST!, () => console.log(`[*] API listening on http://${process.env.HOST}:${process.env.PORT} ... `));
