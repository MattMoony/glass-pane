import { pool } from '../db';

import Organ from './Organ';
import Organization, { OrganizationCache } from './Organization';
import Location from './Location';
import OrganSource from './OrganSource';
import Socials from './Socials';
import type Membership from './Membership';

import { baseLogger } from '../log';
import ORGAN_CACHE from '../cache/organ';


const log = baseLogger('nation');

/**
 * Cache of a nation.
 */
export interface NationCache extends OrganizationCache {}

/**
 * Represents a political nation.
 */
class Nation extends Organization {
  public geo?: GeoJSON.Polygon|null;

  protected _cache: NationCache = {};

  public constructor (id: number, bio: string, name: string, established?: Date|null, dissolved?: Date|null, location?: Location|null, geo?: GeoJSON.Polygon|null) {
    super(id, bio, name, established, dissolved, location);
    this.geo = geo;
    this.cache();
  }

  protected cache(key?: string, value?: string): void {
    if (key && value) return super.cache(key, value);
    const cached = ORGAN_CACHE.get(this.id);
    if (cached === undefined 
        || !(cached instanceof Nation) 
        || cached.name !== this.name 
        || cached.established !== this.established 
        || cached.dissolved !== this.dissolved
        || cached.location !== this.location
    ) {
      log.debug(`Caching nation ${this}`);
      ORGAN_CACHE.set(this.id, this);
    }
  }

  /**
   * Returns a JSON representation of the nation.
   * @returns The JSON representation of the nation.
   */
  public json (): Object {
    return {
      ...super.json(),
      geo: this.geo,
    };
  }

  /**
   * Returns a string representation of the nation.
   * @returns The string representation of the nation.
   */
  public toString (): string {
    return `"${this.name}" (Nation#${this.id})`;
  }

  /**
   * Removes the organization from the database.
   * @returns A promise that resolves when the organization has been removed.
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
  /**
   * Removes a membership from the organ.
   * @param membership The membership to remove.
   * @returns A promise that resolves when the membership has been removed.
   */
  public async remove (membership: Membership): Promise<void>;
  public async remove (v?: OrganSource|Membership|Socials): Promise<void> {
    const Membership = (await import('./Membership')).default;
    if (v instanceof OrganSource) return super.remove(v);
    else if (v instanceof Membership) return super.remove(v);
    else if (v instanceof Socials) return super.remove(v);
    await pool.query('DELETE FROM nation WHERE nid = $1', [this.id]);
    await super.remove();
    log.debug(`Removed nation ${this}`);
    ORGAN_CACHE.delete(this.id);
  }

  /**
   * Gets a nation by its ID.
   * @param id The ID of the nation.
   * @returns A promise that resolves with the nation, or `null` if the nation was not found.
   */
  public static async get (id: number): Promise<Nation|null> {
    id = +id;
    const organization = await super.get(id);
    if (!organization) return null;
    const cached = ORGAN_CACHE.get(id);
    if (cached === undefined || !(cached instanceof Nation)) {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT st_asgeojson(geo) "geo" FROM nation WHERE nid = $1',
        [id]
      );
      client.release();
      if (result.rowCount === 0) return null;
      const geo = result.rows[0].geo;
      return new Nation(
        id, 
        organization.bio, 
        organization.name, 
        organization.established, 
        organization.dissolved, 
        organization.location,
        geo ? JSON.parse(geo) : null
      );
    }
    log.debug(`Hit nation cache ${id}`);
    return (ORGAN_CACHE.get(id) as Nation) || null;
  }

  /**
   * Finds nations by their name.
   * @param name The name of the nation.
   * @returns A promise that resolves with the nations found.
   */
  public static async find (name: string): Promise<Nation[]> {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT nid FROM nation n INNER JOIN organization o ON n.nid = o.oid WHERE name ILIKE $1',
      [`%${name}%`,]
    );
    client.release();
    return (await Promise.all(result.rows.map(row => Nation.get(row.nid))))
           .filter(nation => nation !== null) as Nation[];
  }
}

export default Nation;
