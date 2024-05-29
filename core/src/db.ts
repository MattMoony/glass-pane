import { Pool, PoolClient, types } from 'pg';
import log from './log/db';

// dates are weird ...
types.setTypeParser(types.builtins.DATE, val => {
  return val === null ? null : new Date(val);
});

export const pool: Pool = new Pool({
  max: 20,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 0,
});

pool.on('connect', (client: PoolClient) => {
  log.info('New pool client connection ...');
  client.on('end', () => log.info('Pool client connection ended ...'));
});
