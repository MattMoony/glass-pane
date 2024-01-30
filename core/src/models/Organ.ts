import { pool } from '../db';

/**
 * Represents a member of an organization. That member
 * doesn't have to be a natural person - they could themselves
 * be an organization, for example.
 */
class Organ {
  public id: number;

  public constructor (id: number) {
    this.id = id;
  }

  public json (): Object {
    return {
      id: this.id,
    };
  }

  public toString (): string {
    return `Organ#${this.id}`;
  }

  public static async create (): Promise<number> {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO organ DEFAULT VALUES RETURNING oid');
    client.release();
    return +result.rows[0].oid;
  }
}

export default Organ;
