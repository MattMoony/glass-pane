import { pool } from '../db';
import fs from 'fs';
import fsPromises from 'fs/promises';

/**
 * Represents a source for an organization. This could be a
 * website, a document, or any other kind of resource.
 */
export class OrganSource {
  public sid: number;
  public url: string;

  public constructor (sid: number, url: string) {
    this.sid = sid;
    this.url = url;
  }

  public json (): Object {
    return {
      sid: this.sid,
      url: this.url,
    };
  }

  public toString (): string {
    return `OrganSource#${this.sid}`;
  }

  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE organ_source SET url = $1 WHERE sid = $2', [this.url, this.sid]);
    client.release();
  };

  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM organ_source WHERE sid = $1', [this.sid]);
    client.release();
  };

  public static async create (organ: Organ, url: string): Promise<OrganSource> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO organ_source (organ, url) VALUES ($1, $2) RETURNING sid', [organ.id, url]);
    client.release();
    return new OrganSource(+res.rows[0].sid, url);
  }
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

  public async add (source: string): Promise<OrganSource>;
  public async add (v: string): Promise<OrganSource> {
    if (typeof v === 'string') return OrganSource.create(this, v);
    throw new Error('Invalid addition type');
  }

  public async update (): Promise<void>;
  public async update (source: OrganSource): Promise<void>;
  public update (v?: OrganSource): Promise<void> {
    if (v instanceof OrganSource) return v.update();
    return fsPromises.writeFile(`${process.env.DATA_DIR}/${this.id}.md`, this.bio);
  }

  public async remove (source: OrganSource): Promise<void>;
  public remove (v: OrganSource): Promise<void> {
    if (v instanceof OrganSource) return v.remove();
    throw new Error('Invalid removal type');
  }

  public async sources (): Promise<OrganSource[]> {
    const client = await pool.connect();
    const res = await client.query('SELECT sid, url FROM organ_source WHERE organ = $1', [this.id]);
    client.release();
    return res.rows.map(row => new OrganSource(+row.sid, row.url));
  }

  public static async create (): Promise<Organ>;
  public static async create (bio: string): Promise<Organ>;
  public static async create (v?: string): Promise<Organ> {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO organ DEFAULT VALUES RETURNING oid');
    client.release();
    const oid = +result.rows[0].oid;
    fs.writeFileSync(`${process.env.DATA_DIR}/${oid}.md`, v||'');
    return new Organ(oid, v||'');
  }

  public static async get (id: number): Promise<Organ|null> {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM organ WHERE oid = $1', [id]);
    client.release();
    if (res.rows.length === 0) return null;
    if (!fs.existsSync(`${process.env.DATA_DIR}/${id}.md`)) fs.writeFileSync(`${process.env.DATA_DIR}/${id}.md`, '');
    return new Organ(+res.rows[0].oid, fs.readFileSync(`${process.env.DATA_DIR}/${id}.md`, 'utf8'));
  }
}

export default Organ;
