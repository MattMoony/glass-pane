import * as event from '@/api/event';

import Location from '@/models/Location';
import type Organ from '@/models/Organ';

class Event implements event.Event {
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
   * Updates the event.
   * @returns A promise that resolves when the event has been updated.
   */
  public async update (): Promise<void> {
    await event.update(this.id, this.name, this.desc, this.date, this.location?.id);
  }

  /**
   * Deletes the event.
   * @returns A promise that resolves when the event has been deleted.
   */
  public async remove (): Promise<void> {
    await event.remove(this.id);
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
   * Gets an event by its ID.
   * @param id The ID of the event.
   * @returns A promise that resolves with the event.
   */
  public static async get (id: number): Promise<Event|null> {
    const res = await event.get(id);
    if (!res.event) return null;
    return Event.parse(res.event);
  }

  /**
   * Create a new event.
   * @param name The name of the event.
   * @param desc The description of the event.
   * @param date The date of the event.
   * @param location The location of the event.
   * @returns A promise that resolves with the event.
   */
  public static async create (
    name: string, 
    desc: string, 
    date?: Date, 
    location?: Location
  ): Promise<Event|null> {
    const res = await event.create(name, desc, date, location?.id);
    if (!res.event) return null;
    return Event.parse(res.event);
  }

  /**
   * Search for an event.
   * @param query The query to search for.
   * @returns A promise that resolves with the events that match the query.
   */
  public static async search (query: string): Promise<Event[]> {
    const res = await event.search(query);
    if (!res.events) return [];
    return res.events.map(Event.parse);
  }

  /**
   * Search for events by participant.
   * @param participant The participant to search for.
   * @param query The query to search for.
   * @returns A promise that resolves with the events that match the query.
   */
  public static async searchByParticipant (participant: Organ, query?: string): Promise<Event[]> {
    const res = await event.searchByParticipant(participant, query);
    if (!res.events) return [];
    return res.events.map(Event.parse);
  }

  /**
   * Search for events by date.
   * @param date The date to search for.
   * @param days The number of days to search for events for (before given date).
   * @returns A promise that resolves with the events that match the date.
   */
  public static async searchByDate (date: Date, days?: number): Promise<Event[]> {
    const res = await event.searchByDate(date, days);
    if (!res.events) return [];
    return res.events.map(Event.parse);
  }
}

export default Event;
