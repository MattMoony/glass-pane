import { pool } from '../db';

import Relation from './Relation';

/**
 * Represents a source for a relation.
 */
class RelationSource {
  sid: number;
  url: string;

  public constructor (sid: number, url: string) {
    this.sid = sid;
    this.url = url;
  }

  /**
   * Get the JSON representation of this relation source.
   * @returns {Object} The JSON representation of this relation source.
   */
  public json (): Object {
    return {
      sid: this.sid,
      url: this.url,
    };
  }

  /**
   * Get the string representation of this relation source.
   * @returns {string} The string representation of this relation source.
   */
  public toString (): string {
    return `RelationSource#${this.sid} (${this.url})`;
  }

  /**
   * Update this relation source in the database.
   * @returns {Promise<void>} A promise that resolves when the source is updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'UPDATE relation_source SET url = $1 WHERE sid = $2',
      [this.url, this.sid],
    );
    client.release();
  }

  /**
   * Remove this relation source from the database.
   * @returns {Promise<void>} A promise that resolves when the source is removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'DELETE FROM relation_source WHERE sid = $1',
      [this.sid],
    );
    client.release();
  }

  /**
   * Get a relation source from the database.
   * @param {number} sid The ID of the source to get.
   * @returns {Promise<RelationSource|null>} A promise that resolves with the source, or null if not found.
   */
  public static async get (sid: number): Promise<RelationSource|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM relation_source WHERE sid = $1',
      [sid],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new RelationSource(sid, res.rows[0].url);
  }

  /**
   * Create a new relation source in the database.
   * @param {Relation} relation The relation to add the source to.
   * @param {string} url The URL of the source.
   * @returns {Promise<RelationSource>} A promise that resolves with the created source.
   */
  public static async create (relation: Relation, url: string): Promise<RelationSource> {
    const client = await pool.connect();
    const res = await client.query(
      'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4) RETURNING sid',
      [relation.from.id, relation.to.id, relation.since, url],
    );
    client.release();
    return new RelationSource(+res.rows[0].sid, url);
  }
}

export default RelationSource;
