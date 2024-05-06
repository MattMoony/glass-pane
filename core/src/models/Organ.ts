import { pool } from '../db';
import fs from 'fs';
import fsPromises from 'fs/promises';

/**
 * Represents a source for an organ. This could be a
 * website, a document, or any other kind of resource.
 */
export class OrganSource {
  public sid: number;
  public url: string;

  public constructor (sid: number, url: string) {
    this.sid = sid;
    this.url = url;
  }

  /**
   * Returns a JSON representation of the source.
   * @returns The JSON representation of the source.
   */
  public json (): Object {
    return {
      sid: this.sid,
      url: this.url,
    };
  }

  /**
   * Returns a string representation of the source.
   * @returns The string representation of the source.
   */
  public toString (): string {
    return `OrganSource#${this.sid}`;
  }

  /**
   * Updates the source in the database.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE organ_source SET url = $1 WHERE sid = $2', [this.url, this.sid]);
    client.release();
  };

  /**
   * Removes the source from the database.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM organ_source WHERE sid = $1', [this.sid]);
    client.release();
  };

  /**
   * Creates a new source for an organ.
   * @param organ The organ to create the source for.
   * @param url The URL of the source.
   * @returns A promise that resolves with the created source.
   */
  public static async create (organ: Organ, url: string): Promise<OrganSource> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO organ_source (organ, url) VALUES ($1, $2) RETURNING sid', [organ.id, url]);
    client.release();
    return new OrganSource(+res.rows[0].sid, url);
  }
}

/**
 * Represents a member of an organ. That member
 * doesn't have to be a natural person - they could themselves
 * be an organ, for example.
 */
class Organ {
  public id: number;
  public bio: string;

  public constructor (id: number, bio: string) {
    this.id = id;
    this.bio = bio;
  }

  /**
   * Returns a JSON representation of the organ.
   * @returns The JSON representation of the organ.
   */
  public json (): Object {
    return {
      id: this.id,
      bio: this.bio,
    };
  }

  /**
   * Returns a string representation of the organ.
   * @returns The string representation of the organ.
   */
  public toString (): string {
    return `Organ#${this.id}`;
  }

  /**
   * Adds a source to the organ.
   * @param source The source to add.
   * @returns A promise that resolves with the added source.
   */
  public async add (source: string): Promise<OrganSource>;
  public async add (v: string): Promise<OrganSource> {
    if (typeof v === 'string') return OrganSource.create(this, v);
    throw new Error('Invalid addition type');
  }

  /**
   * Updates the organ in the database.
   * @returns A promise that resolves when the organ has been updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a source for the organ.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (source: OrganSource): Promise<void>;
  public update (v?: OrganSource): Promise<void> {
    if (v instanceof OrganSource) return v.update();
    return fsPromises.writeFile(`${process.env.DATA_DIR}/${this.id}.md`, this.bio);
  }

  /**
   * Removes the organ from the database.
   * @returns A promise that resolves when the organ has been removed.
   */
  public async remove (): Promise<void>;
  /**
   * Removes a source from the organ.
   * @param source The source to remove.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (source: OrganSource): Promise<void>;
  public async remove (v?: OrganSource): Promise<void> {
    if (v instanceof OrganSource) return v.remove();
    const client = await pool.connect();
    await client.query('DELETE FROM organ WHERE oid = $1', [this.id]);
    client.release();
  }

  /**
   * Returns all sources for the organ.
   * @returns A promise that resolves with all sources for the organ.
   */
  public async sources (): Promise<OrganSource[]> {
    const client = await pool.connect();
    const res = await client.query('SELECT sid, url FROM organ_source WHERE organ = $1', [this.id]);
    client.release();
    return res.rows.map(row => new OrganSource(+row.sid, row.url));
  }

  /**
   * Creates a new organ.
   * @returns A promise that resolves with the created organ.
   */
  public static async create (): Promise<Organ>;
  /**
   * Creates a new organ with a bio.
   * @param bio The bio of the organ.
   * @returns A promise that resolves with the created organ.
   */
  public static async create (bio: string): Promise<Organ>;
  public static async create (v?: string): Promise<Organ> {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO organ DEFAULT VALUES RETURNING oid');
    client.release();
    const oid = +result.rows[0].oid;
    fs.writeFileSync(`${process.env.DATA_DIR}/${oid}.md`, v||'');
    return new Organ(oid, v||'');
  }

  /**
   * Finds an organ by its ID.
   * @param id The ID of the organ to find.
   * @returns A promise that resolves with the found organ, or null if it doesn't exist.
   */
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
