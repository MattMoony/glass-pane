import { pool } from '../db';

import Organization, { OrganizationCache } from './Organization';
import Location from './Location';
import { baseLogger } from '../log';

import ORGAN_CACHE from '../cache/organ';
import OrganSource from './OrganSource';
import Socials from './Socials';
import Membership from './Membership';
import Organ from './Organ';


const log = baseLogger('nation');

/**
 * Cache of a nation.
 */
export interface NationCache extends OrganizationCache {}

/**
 * Represents a political nation.
 */
class Nation extends Organization {
  public location?: Location|null;

  protected _cache: NationCache = {};

  public constructor (id: number, bio: string, name: string, established?: Date|null, dissolved?: Date|null, location?: Location|null) {
    super(id, bio, name, established, dissolved);
    this.location = location;
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
      location: this.location?.json(),
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
   * Updates the organization in the database.
   * @returns A promise that resolves when the organization has been updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a source for the organ.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (source: OrganSource): Promise<void>;
  /**
   * Updates a social media account for the organ.
   * @param socials The social media account to update.
   * @returns A promise that resolves when the social media accounts have been updated.
   */
  public async update (socials: Socials): Promise<void>;
  /**
   * Updates a membership of the organ.
   * @param membership The membership to update.
   * @returns A promise that resolves when the membership has been updated.
   */
  public async update (membership: Membership): Promise<void>;
  public async update (v?: Membership|OrganSource|Socials): Promise<void> {
    if (v instanceof Membership) return super.update(v);
    else if (v instanceof OrganSource) return super.update(v);
    else if (v instanceof Socials) return super.update(v);
    await super.update();
    await pool.query('UPDATE nation SET location = $1 WHERE nid = $2', [this.location?.id, this.id,]);
    this.cache();
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
    if (v instanceof OrganSource) return super.remove(v);
    else if (v instanceof Membership) return super.remove(v);
    else if (v instanceof Socials) return super.remove(v);
    await pool.query('DELETE FROM nation WHERE nid = $1', [this.id]);
    await super.remove();
    log.debug(`Removed nation ${this}`);
    ORGAN_CACHE.delete(this.id);
  }

  /**
   * Creates a new organ.
   * @returns A promise that resolves with the new organ.
   */
  public static async create (): Promise<Organ>;
  /**
   * Creates a new organ.
   * @deprecated Use `Organ.create` with the bio string instead.
   * @param bio The bio of the organ.
   * @returns A promise that resolves with the new organ.
   */
  public static async create (bio: string): Promise<Organ>;
  /**
   * Creates a new organization.
   * @param name The name of the organization.
   * @param bio The bio of the organization.
   * @param established The date the organization was established.
   * @param dissolved The date the organization was dissolved.
   * @returns A promise that resolves with the new organization.
   */
  public static async create (name: string, bio: string, established?: Date, dissolved?: Date): Promise<Nation>;
  /**
   * Creates a new nation in the database.
   * @param bio The biography of the nation.
   * @param name The name of the nation.
   * @param established The date the nation was established.
   * @param dissolved The date the nation was dissolved.
   * @param location The location of the nation.
   * @returns A promise that resolves when the nation has been created.
   */
  public static async create (bio: string, name: string, established?: Date, dissolved?: Date, location?: Location): Promise<Nation>;
  public static async create (v?: string, v2?: string, v3?: Date, v4?: Date, v5?: Location): Promise<Organ|Nation> {
    if (typeof v === 'undefined') return super.create();
    else if (typeof v === 'string' && typeof v2 === 'undefined') return super.create(v);
    else if (typeof v === 'string' && typeof v2 === 'string' && typeof v5 === 'undefined') {
      const organization = await super.create(v, v2, v3, v4);
      return new Nation(organization.id, organization.bio, organization.name, organization.established, organization.dissolved);
    }
    else if (typeof v === 'string' && typeof v2 === 'string' && v5 instanceof Location) {
      const client = await pool.connect();
      const result = await client.query(
        'INSERT INTO nation (bio, name, established, dissolved, location) VALUES ($1, $2, $3, $4, $5) RETURNING nid',
        [v, v2, v3, v4, v5?.id,]
      );
      const nation = new Nation(+result.rows[0].nid, v, v2, v3, v4, v5);
      client.release();
      log.debug(`Created nation ${nation}`);
      return nation;
    }
    throw new Error('Invalid creation type');
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
        'SELECT location FROM nation WHERE nid = $1',
        [id]
      );
      client.release();
      const location = result.rows[0].location;
      return new Nation(
        id, 
        organization.bio, 
        organization.name, 
        organization.established, 
        organization.dissolved, 
        location ? await Location.get(location) : undefined
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
      'SELECT nid FROM nation WHERE name = $1',
      [name]
    );
    client.release();
    return (await Promise.all(result.rows.map(row => Nation.get(row.nid))))
           .filter(nation => nation !== null) as Nation[];
  }
}

export default Nation;
