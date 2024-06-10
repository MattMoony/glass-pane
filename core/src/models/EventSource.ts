import { pool } from '../db';

import Event from './Event';

/**
 * Represents a source for an event. This could be a
 * website, a document, or any other kind of resource.
 */
export class EventSource {
  public id: number;
  public url: string;

  public constructor (sid: number, url: string) {
    this.id = sid;
    this.url = url;
  }

  /**
   * Returns a JSON representation of the source.
   * @returns The JSON representation of the source.
   */
  public json (): Object {
    return {
      sid: this.id,
      url: this.url,
    };
  }

  /**
   * Returns a string representation of the source.
   * @returns The string representation of the source.
   */
  public toString (): string {
    return `EventSource#${this.id}`;
  }

  /**
   * Updates the source in the database.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE event_source SET url = $1 WHERE sid = $2', [this.url, this.id]);
    client.release();
  };

  /**
   * Removes the source from the database.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM event_source WHERE sid = $1', [this.id]);
    client.release();
  };

  /**
   * Creates a new source for an event.
   * @param event The event to create the source for.
   * @param url The URL of the source.
   * @returns A promise that resolves with the created source.
   */
  public static async create (event: Event, url: string): Promise<EventSource> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO event_source (eid, url) VALUES ($1, $2) RETURNING sid', [event.id, url]);
    client.release();
    return new EventSource(+res.rows[0].sid, url);
  }
}

export default EventSource;
