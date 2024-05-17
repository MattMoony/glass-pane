import { pool } from '../db';
import fs from 'fs';
import fsPromises from 'fs/promises';

import OrganSource from './OrganSource';
import SocialsPlatforms from './SocialsPlatforms';
import Socials from './Socials';

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
  /**
   * Adds a social media account to the organ.
   * @param platform The platform of the account.
   * @param url The URL of the account.
   * @returns A promise that resolves with the added source.
   */
  public async add (platform: SocialsPlatforms, url: string): Promise<Socials>;
  public async add (v: string|SocialsPlatforms, v2?: string): Promise<OrganSource|Socials> {
    if (typeof v === 'string') return OrganSource.create(this, v);
    else if (typeof v === 'number') return Socials.create(this, v, v2 as string);
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
  /**
   * Updates the social media account for the organ.
   * @param socials The social media account to update.
   * @returns A promise that resolves when the social media accounts have been updated.
   */
  public async update (socials: Socials): Promise<void>;
  public update (v?: OrganSource|Socials): Promise<void> {
    if (v instanceof OrganSource) return v.update();
    else if (v instanceof Socials) return v.update();
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
  /**
   * Removes a social media account from the organ.
   * @param socials The social media account to remove.
   * @returns A promise that resolves when the social media account has been removed.
   */
  public async remove (socials: Socials): Promise<void>;
  public async remove (v?: OrganSource|Socials): Promise<void> {
    if (v instanceof OrganSource) return v.remove();
    else if (v instanceof Socials) return v.remove();
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
   * Returns all social media accounts for the organ.
   * @returns A promise that resolves with all social media accounts for the organ.
   */
  public async socials (): Promise<Socials[]> {
    const client = await pool.connect();
    const res = await client.query('SELECT sid, platform, url FROM socials WHERE organ = $1', [this.id]);
    client.release();
    return res.rows.map(row => new Socials(+row.sid, row.platform, row.url));
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
    const _id = +id;
    if (isNaN(_id)) return null;
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM organ WHERE oid = $1', [_id]);
    client.release();
    if (res.rows.length === 0) return null;
    if (!fs.existsSync(`${process.env.DATA_DIR}/${_id}.md`)) fs.writeFileSync(`${process.env.DATA_DIR}/${_id}.md`, '');
    return new Organ(+res.rows[0].oid, fs.readFileSync(`${process.env.DATA_DIR}/${_id}.md`, 'utf8'));
  }
}

export default Organ;
