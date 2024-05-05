import { Pool, types } from 'pg';

// dates are weird ...
types.setTypeParser(types.builtins.DATE, val => {
  return val === null ? null : new Date(val);
});

export const pool: Pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
