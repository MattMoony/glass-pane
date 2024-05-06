import { pool } from '../db';
import fs from 'fs';
import fsPromises from 'fs/promises';

export interface OrganSource {
  sid: number;
  url: string;
}

/**
 * Represents a member of an organization. That member
 * doesn't have to be a natural person - they could themselves
 * be an organization, for example.
 */
class Organ {
  public id: number;
  public bio: string;

  public constructor (id: number, bio: string) {
    this.id = id;
    this.bio = bio;
  }

  public json (): Object {
    return {
      id: this.id,
      bio: this.bio,
    };
  }

  public toString (): string {
    return `Organ#${this.id}`;
  }

  public update (): Promise<void> {
    return fsPromises.writeFile(`${process.env.DATA_DIR}/${this.id}.md`, this.bio);
  }

  public static async create (): Promise<number> {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO organ DEFAULT VALUES RETURNING oid');
    client.release();
    const oid = +result.rows[0].oid;
    fs.writeFileSync(`${process.env.DATA_DIR}/${oid}.md`, '');
    return oid;
  }

  public static async get (id: number): Promise<Organ|null> {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM organ WHERE oid = $1', [id]);
    client.release();
    if (res.rows.length === 0) return null;
    if (!fs.existsSync(`${process.env.DATA_DIR}/${id}.md`)) fs.writeFileSync(`${process.env.DATA_DIR}/${id}.md`, '');
    return new Organ(+res.rows[0].oid, fs.readFileSync(`${process.env.DATA_DIR}/${id}.md`, 'utf8'));
  }

  public async getSources (): Promise<OrganSource[]> {
    const client = await pool.connect();
    const res = await client.query('SELECT sid, url FROM organ_source WHERE organ = $1', [this.id]);
    client.release();
    return res.rows.map(row => ({ sid: +row.sid, url: row.url }));
  }

  public async addSource (url: string): Promise<number> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO organ_source (organ, url) VALUES ($1, $2) RETURNING sid', [this.id, url]);
    client.release();
    return +res.rows[0].sid;
  };

  public async removeSource (sid: number): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM organ_source WHERE sid = $1', [sid]);
    client.release();
  };

  public async updateSource (sid: number, url: string): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE organ_source SET url = $1 WHERE sid = $2', [url, sid]);
    client.release();
  };
}

export default Organ;
