import { pool } from '../db';

import Organ, { OrganCache } from './Organ';
import OrganSource from './OrganSource';
import Membership from './Membership';
import Socials from './Socials';
import log from '../log/organization';

import ORGAN_CACHE from '../cache/organ';


/**
 * Cache of an organization.
 */
export interface OrganizationCache extends OrganCache {
  members?: Membership[];
}

/**
 * Represents an organization - i.e. a grouping of several
 * natural or non-natural people. Could be anything from a business
 * to a nation.
 */
class Organization extends Organ {
  public name: string;
  public established?: Date|null;
  public dissolved?: Date|null;

  protected _cache: OrganizationCache = {};

  public constructor (id: number, bio: string, name: string, established?: Date|null, dissolved?: Date|null) {
    super(id, bio);
    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
    this.cache();
  }

  protected cache(key?: string, value?: string): void {
    if (key && value) return super.cache(key, value);
    const cached = ORGAN_CACHE.get(this.id);
    if (cached === undefined 
        || !(cached instanceof Organization) 
        || cached.name !== this.name 
        || cached.established !== this.established 
        || cached.dissolved !== this.dissolved
    ) {
      log.debug(`Caching organization ${this}`);
      ORGAN_CACHE.set(this.id, this);
    }
  }

  /**
   * Returns a JSON representation of the organization.
   * @returns The JSON representation of the organization.
   */
  public json (): Object {
    return {
      ...super.json(),
      name: this.name,
      established: this.established?.toISOString(),
      dissolved: this.dissolved?.toISOString(),
    };
  }

  /**
   * Returns a string representation of the organization.
   * @returns The string representation of the organization.
   */
  public toString (): string {
    return `"${this.name}" (Organization#${this.id})`;
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
    const client = await pool.connect();
    await client.query(
      'UPDATE organization SET name = $1, established = $2, dissolved = $3 WHERE oid = $4',
      [this.name, this.established, this.dissolved, this.id]
    );
    client.release();
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
    // TODO: not 100% correct - same as in person,
    // TODO: organ, etc. - fix this later
    const client = await pool.connect();
    await client.query(
      'DELETE FROM organization WHERE oid = $1',
      [this.id]
    );
    client.release();
    super.remove();
    log.debug(`Nulling organization cache ${this}`);
    ORGAN_CACHE.delete(this.id);
  }

  /**
   * Returns all members of the organization.
   * @returns A promise that resolves with all members for the organization.
   */
  public async members (): Promise<Membership[]> {
    if (!this._cache.members) {
      log.info(`Missed members cache for ${this}`);
      const Membership = (await import('./Membership')).default;
      this._cache.members = await Membership.get(this);
    }
    log.debug(`Hit members cache for ${this}`);
    return this._cache.members;
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
  public static async create (name: string, bio: string, established?: Date, dissolved?: Date): Promise<Organization>;
  public static async create (v?: string, v2?: string, v3?: Date, v4?: Date): Promise<Organ|Organization> {
    if (typeof v === 'undefined') return super.create();
    if (typeof v === 'string' && typeof v2 === 'undefined') return super.create(v);
    if (typeof v === 'string' && typeof v2 === 'string') {
      const organ = v2 ? await Organ.create(v2) : await super.create();
      const client = await pool.connect();
      const res = await client.query(
        'INSERT INTO organization (oid, name, established, dissolved) VALUES ($1, $2, $3, $4) RETURNING oid',
        [organ.id, v, v3, v4]
      );
      client.release();
      return new Organization(organ.id, organ.bio, v, v3, v4);
    }
    throw new Error('Invalid creation type');
  }

  /**
   * Gets an organization by its ID.
   * @param id The ID of the organization.
   * @returns A promise that resolves with the organization, or null if it doesn't exist.
   */
  public static async get (id: number): Promise<Organization|null> {
    id = +id;
    const organ = await super.get(id);
    if (!organ) return null;
    const cached = ORGAN_CACHE.get(id);
    if (cached === undefined || !(cached instanceof Organization)) {
      log.info(`Missed organization cache for ${id}`);
      const client = await pool.connect();
      const res = await client.query(
        'SELECT name, established, dissolved FROM organization WHERE oid = $1', 
        [id]
      );
      client.release();
      if (res.rows.length === 0) return null;
      return new Organization(
        organ.id,
        organ.bio,
        res.rows[0].name,
        res.rows[0].established,
        res.rows[0].dissolved
      ); 
    }
    log.debug(`Hit organization cache ${id}`);
    return (ORGAN_CACHE.get(id) as Organization) || null;
  }

  /**
   * Get a random organization.
   * @returns A promise that resolves with a random organization.
   */
  public static async random (): Promise<Organization|null> {
    const client = await pool.connect();
    const res = await client.query('SELECT oid FROM organization ORDER BY RANDOM() LIMIT 1');
    client.release();
    return res.rows.length === 0 ? null : await Organization.get(res.rows[0].oid);
  }

  /**
   * Finds organizations by their name.
   * @param query The name to search for.
   * @returns A promise that resolves with the organizations found.
   */
  public static async find (query: string): Promise<Organization[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   *
       FROM     organization
       WHERE    name ILIKE $1`,
      [`%${query}%`]
    );
    client.release();
    return Promise.all(res.rows.map(async row => new Organization(
      +row.oid,
      (await Organ.get(+row.oid))!.bio,
      row.name,
      row.established,
      row.dissolved
    )));
  }
}

export default Organization;
