import { pool } from '../db';
import { baseLogger } from '../log';
import EVENT_CACHE from '../cache/event';
import fs from 'fs';
import fsPromises from 'fs/promises';

import Location from './Location';
import type Organ from './Organ';


const log = baseLogger('location');

class Event {
  public id: number;
  public name: string;
  public desc: string;
  public date?: Date|null;
  public location?: Location|null;

  public constructor(id: number, name: string, desc?: string, date?: Date|null, location?: Location|null) {
    this.id = id;
    this.name = name;
    this.desc = desc || '';
    this.date = date;
    this.location = location;
    this.cache();
  }

  protected cache (): void {
    const cached = EVENT_CACHE.get(this.id);
    if (cached === undefined 
        || !(cached instanceof Event) 
        || cached.name !== this.name 
        || cached.date !== this.date
        || cached.location !== this.location
    ) {
      log.debug(`Caching event ${this}`);
      EVENT_CACHE.set(this.id, this);
    }
  }

  /**
   * Returns a string representation of the event.
   * @returns A string representation of the event.
   */
  public toString (): string {
    return `"${this.name}" (Event#${this.id})`;
  }

  /**
   * Returns a JSON representation of the event.
   * @returns A JSON representation of the event.
   */
  public json (): Object {
    return {
      id: this.id,
      name: this.name,
      desc: this.desc,
      date: this.date?.toISOString(),
      location: this.location?.json(),
    };
  }

  /**
   * Gets the participants for the event.
   * @returns A promise that resolves with the participants.
   */
  public async participants (): Promise<Organ[]> {
    const Organ = (await import('./Organ')).default;
    const Person = (await import('./Person')).default;
    const Organization = (await import('./Organization')).default;
    const { rows } = await pool.query(
      'SELECT organ FROM event_participant WHERE event = $1', 
      [this.id,]
    );
    return Promise.all(rows.map(async (row: { organ: number }) => {
      let organ: Organ|null = null;
      organ = await Person.get(row.organ);
      if (organ === null) organ = await Organization.get(row.organ);
      return organ;
    })) as Promise<Organ[]>;
  }

  /**
   * Updates the event in the database.
   * @returns A promise that resolves when the event has been updated.
   */
  public async update (): Promise<void> {
    await pool.query(
      'UPDATE event SET name = $1, date = $2, location = $3 WHERE eid = $4', 
      [this.name, this.date, this.location?.id, this.id,]
    );
    log.debug(`Updated event ${this}`);
    this.cache();
    return fsPromises.writeFile(`${process.env.DATA_DIR}/events/${this.id}.md`, this.desc);
  }

  /**
   * Deletes the event from the database.
   * @returns A promise that resolves when the event has been deleted.
   */
  public async remove (): Promise<void> {
    await pool.query('DELETE FROM event WHERE eid = $1', [this.id]);
    log.debug(`Deleted event ${this}`);
    EVENT_CACHE.delete(this.id);
  }

  /**
   * Parses an event from JSON.
   * @param json The JSON to parse.
   * @returns The parsed event.
   */
  public static parse (json: any): Event {
    return new Event(
      json.id, 
      json.name, 
      json.desc,
      json.date ? new Date(json.date) : undefined, 
      json.location ? Location.parse(json.location) : undefined
    );
  }

  /**
   * Creates a new event in the database.
   * @param name The name of the event.
   * @param date The date of the event.
   * @param location The location of the event.
   * @returns A promise that resolves with the new event.
   */
  public static async create (name: string, desc?: string, date?: Date, location?: Location): Promise<Event> {
    const result = await pool.query(
      'INSERT INTO event (name, date, location) VALUES ($1, $2, $3) RETURNING eid',
      [name, date, location?.id]
    );
    const id = result.rows[0].eid;
    const event = new Event(id, name, desc, date, location);
    fs.writeFileSync(`${process.env.DATA_DIR}/events/${id}.md`, desc || '');
    log.debug(`Created event ${event}`);
    return event;
  }

  /**
   * Fetches an event from the database.
   * @param id The ID of the event to fetch.
   * @returns A promise that resolves with the event.
   */
  public static async get (id: number): Promise<Event|null> {
    id = +id;
    const cached = EVENT_CACHE.get(id);
    if (cached === undefined || !(cached instanceof Event)) {
      const { rows } = await pool.query('SELECT name, date, location FROM event WHERE eid = $1', [id]);
      if (!fs.existsSync(`${process.env.DATA_DIR}/events/${id}.md`)) 
        fs.writeFileSync(`${process.env.DATA_DIR}/events/${id}.md`, '');
      const event = new Event(
        id, 
        rows[0].name, 
        fs.readFileSync(`${process.env.DATA_DIR}/events/${id}.md`, 'utf8'),
        rows[0].date, 
        await Location.get(rows[0].location)
      );
      log.debug(`Fetched event ${event}`);
      return event;
    }
    log.debug(`Hit cache for event ${cached}`);
    return (cached as Event)||null;
  }

  /**
   * Find an event by name.
   * @param name The name of the event to find.
   * @returns A promise that resolves with the event.
   */
  public static async find (name: string): Promise<Event[]>;
  /**
   * Find all events for a participant.
   * @param participant The participant to find events for.
   * @returns A promise that resolves with the events.
   */
  public static async find (participant: Organ): Promise<Event[]>;
  /**
   * Find all events on a date.
   * @param date The date to find events for.
   * @returns A promise that resolves with the events.
   */
  public static async find (date: Date): Promise<Event[]>;
  /**
   * Find all events on and x days before a date.
   * @param date The date to find events for.
   * @param days The number of days to find events for (before given date).
   * @returns A promise that resolves with the events.
   */
  public static async find (date: Date, days: number): Promise<Event[]>;
  /**
   * Find an event by name for a participant.
   * @param name The name of the event to find.
   * @param participant The participant to find the event for.
   * @returns A promise that resolves with the event.
   */
  public static async find (name: string, participant: Organ): Promise<Event[]>;
  public static async find (v: string|Organ|Date, v2?: Organ|number): Promise<Event[]> {
    const Organ = (await import('./Organ')).default;
    if (typeof v === 'string' && v2 === undefined) {
      const { rows } = await pool.query(
        'SELECT eid FROM event WHERE name ILIKE $1', 
        [`%${v}%`,]
      );
      return (await Promise.all(rows.map((row: { eid: number }) => Event.get(row.eid))))
             .filter((event: Event|null) => event !== null) as Event[];
    }
    else if (v instanceof Organ && v2 === undefined) {
      const { rows } = await pool.query(
        'SELECT eid FROM event_participant WHERE organ = $1', 
        [v.id,]
      );
      return (await Promise.all(rows.map((row: { eid: number }) => Event.get(row.eid))))
             .filter((event: Event|null) => event !== null) as Event[];  
    }
    else if (v instanceof Date && v2 === undefined) {
      const { rows } = await pool.query(
        'SELECT eid FROM event WHERE date = $1', 
        [v,]
      );
      return (await Promise.all(rows.map((row: { eid: number }) => Event.get(row.eid)))
             ).filter((event: Event|null) => event !== null) as Event[];
    }
    else if (typeof v === 'string' && v2 instanceof Organ) {
      const { rows } = await pool.query(
        'SELECT eid FROM event_participant WHERE organ = $1 AND eid IN (SELECT eid FROM event WHERE name ILIKE $2)', 
        [v2.id, `%${v}%`,]
      );
      return (await Promise.all(rows.map((row: { eid: number }) => Event.get(row.eid))))
             .filter((event: Event|null) => event !== null) as Event[];
    }
    else if (v instanceof Date && typeof v2 === 'number') {
      const { rows } = await pool.query(
        `
         SELECT   date
         FROM     event
         WHERE    date <= $1
         GROUP BY date
         ORDER BY date DESC
         LIMIT    $2
        `,
        [v, v2,]
      );
      return (await Promise.all(rows.map((row: { date: Date }) => Event.find(row.date))))
              .flat() as Event[];
    }
    throw new Error('Invalid arguments');
  }
}

export default Event;
