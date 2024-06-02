import { pool } from '../db';

import { baseLogger } from '../log';

import LOCATION_CACHE from '../cache/location';


const log = baseLogger('location');

/**
 * Represents a physical location.
 */
class Location {
  public id: number;
  public name: string;
  public coords?: GeoJSON.Point|null;

  public constructor (id: number, name: string, coords?: GeoJSON.Point|null) {
    this.id = id;
    this.name = name;
    this.coords = coords;
    this.cache();
  }

  protected cache (): void {
    const cached = LOCATION_CACHE.get(this.id);
    if (cached === undefined 
        || !(cached instanceof Location) 
        || cached.name !== this.name 
        || cached.coords !== this.coords
    ) {
      log.debug(`Caching location ${this}`);
      LOCATION_CACHE.set(this.id, this);
    }
  }

  /**
   * Returns a JSON representation of the location.
   * @returns The JSON representation of the location.
   */
  public json (): Object {
    return {
      id: this.id,
      name: this.name,
      coords: this.coords,
    };
  }

  /**
   * Returns a string representation of the location.
   * @returns The string representation of the location.
   */
  public toString (): string {
    return `"${this.name}" (Location#${this.id})`;
  }

  /**
   * Updates the location in the database.
   * @returns A promise that resolves when the location has been updated.
   */
  public async update (): Promise<void> {
    await pool.query('UPDATE location SET name = $1, coords = st_geomfromgeojson($2) WHERE lid = $3', [this.name, this.coords, this.id]);
    log.debug(`Updated location ${this}`);
    this.cache();
  }

  /**
   * Removes the location from the database.
   * @returns A promise that resolves when the location is removed.
   */
  public async remove (): Promise<void> {
    await pool.query('DELETE FROM location WHERE lid = $1', [this.id]);
    log.debug(`Removed location ${this}`);
    LOCATION_CACHE.delete(this.id);
  }

  /**
   * Creates a new location in the database.
   * @param name The name of the location.
   * @param coords The coordinates of the location.
   * @returns A promise that resolves with the new location.
   */
  public static async create (name: string, coords?: GeoJSON.Point): Promise<Location> {
    const { rows } = await pool.query('INSERT INTO locations (name, coords) VALUES ($1, st_geomfromgeojson($2)) RETURNING lid', [name, coords]);
    return new Location(+rows[0].lid, name, coords);
  }

  /**
   * Gets a location from the database.
   * @param id The ID of the location to get.
   * @returns A promise that resolves with the location, or null if it was not found.
   */
  public static async get (id: number): Promise<Location|null> {
    id = +id;
    const cached = LOCATION_CACHE.get(id);
    if (cached === undefined || !(cached instanceof Location)) {
      const { rows } = await pool.query('SELECT lid, name, st_asgeojson(coords) "coords" FROM location WHERE lid = $1', [id,]);
      if (rows.length === 0) return null;
      const { name, coords } = rows[0];
      return new Location(+id, name, JSON.parse(coords));
    }
    log.debug(`Hit location cache ${id}`);
    return (cached as Location) || null;
  }

  /**
   * Finds locations by their name.
   * @param query The name to search for.
   * @returns A promise that resolves with the locations found.
   */
  public static async find (query: string): Promise<Location[]> {
    const { rows } = await pool.query('SELECT lid, name, st_asgeojson(coords) "coords" FROM location WHERE name ILIKE $1', [`%${query}%`]);
    return rows.map(({ lid, name, coords }) => new Location(+lid, name, JSON.parse(coords)));
  }
}

export default Location;
