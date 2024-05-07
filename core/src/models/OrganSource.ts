import { pool } from '../db';

import Organ from './Organ';

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

export default OrganSource;
