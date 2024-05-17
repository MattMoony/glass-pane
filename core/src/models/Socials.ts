import { pool } from '../db';

import Organ from './Organ';
import SocialsPlatforms from './SocialsPlatforms';

/**
 * Represents a social media account.
 */
class Socials {
  public id: number;
  public platform: SocialsPlatforms;
  public url: string;

  public constructor (id: number, platform: SocialsPlatforms, url: string) {
    this.id = id;
    this.platform = platform;
    this.url = url;
  }

  /**
   * Returns a JSON representation of the social media account.
   * @returns The JSON representation of the social media account.
   */
  public json (): Object {
    return {
      id: this.id,
      platform: SocialsPlatforms[this.platform].toLowerCase(),
      url: this.url,
    };
  }

  /**
   * Returns a string representation of the social media account.
   * @returns The string representation of the social media account.
   */
  public toString (): string {
    return `${SocialsPlatforms[this.platform]}#${this.id}`;
  }

  /**
   * Updates the social media account in the database.
   * @returns A promise that resolves when the social media account has been updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE socials SET platform = $1, url = $2 WHERE sid = $3', [this.platform, this.url, this.id]);
    client.release();
  }

  /**
   * Removes the social media account from the database.
   * @returns A promise that resolves when the social media account has been removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM socials WHERE sid = $1', [this.id]);
    client.release();
  }

  /**
   * Creates a new social media account.
   * @param organ The organ to create the social media account for.
   * @param platform The platform of the account.
   * @param url The URL of the account.
   * @returns A promise that resolves with the new social media account.
   */
  public static async create (organ: Organ, platform: SocialsPlatforms, url: string): Promise<Socials> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO socials (organ, platform, url) VALUES ($1, $2, $3) RETURNING sid', [organ.id, platform, url]);
    client.release();
    return new Socials(+res.rows[0].sid, platform, url);
  }
}

export default Socials;
