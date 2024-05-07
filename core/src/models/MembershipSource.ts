import { pool } from '../db';

import Membership from './Membership';

/**
 * Represents a source for a membership.
 */
class MembershipSource {
  sid: number;
  url: string;

  constructor (sid: number, url: string) {
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
    return `MembershipSource#${this.sid}`;
  }

  /**
   * Updates the source in the database.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'UPDATE membership_source SET url = $1 WHERE sid = $2',
      [this.url, this.sid]
    );
    client.release();
  }

  /**
   * Removes the source from the database.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'DELETE FROM membership_source WHERE sid = $1',
      [this.sid]
    );
    client.release();
  }

  /**
   * Creates a new source.
   * @param membership The membership to create the source for.
   * @param url The URL of the source.
   * @returns A promise that resolves with the new source.
   */
  public static async create (membership: Membership, url: string): Promise<MembershipSource> {
    const client = await pool.connect();
    const res = await client.query(
      'INSERT INTO membership_source (organ, organization, role, since, url) VALUES ($1, $2, $3, $4, $5) RETURNING sid',
      [membership.organ.id, membership.organization.id, membership.role.id, membership.since, url]
    );
    client.release();
    return new MembershipSource(res.rows[0].sid, url);
  }

  /**
   * Gets a source by its ID.
   * @param sid The ID of the source.
   * @returns A promise that resolves with the source, or null if it doesn't exist.
   */
  public static async get (sid: number): Promise<MembershipSource|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT url FROM membership_source WHERE sid = $1',
      [sid]
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new MembershipSource(sid, res.rows[0].url);
  }
}

export default MembershipSource;
