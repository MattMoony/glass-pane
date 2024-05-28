import { pool } from '../db';

import Organ, { OrganCache } from './Organ';
import OrganSource from './OrganSource';
import Membership from './Membership';
import MembershipSource from './MembershipSource';
import SocialsPlatforms from './SocialsPlatforms';
import Socials from './Socials';
import log from '../log/organization';

/**
 * A cache of all organizations in order not to overload the DB.
 */
const ORGANIZATION_CACHE: Map<number, Organization|null> = new Map();

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
  public established?: Date;
  public dissolved?: Date;

  public _cache: OrganizationCache = {};

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date) {
    super(id, bio);
    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
    this.cache();
  }

  public cache(): void {
    log.info(`Caching organization ${this}`);
    ORGANIZATION_CACHE.set(this.id, this);    
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
   * Adds a source to the organization.
   * @param source The source to add.
   * @returns A promise that resolves with the new source.
   */
  public async add (source: string): Promise<OrganSource>;
  /**
   * Adds a social media account to the organ.
   * @param platform The platform of the account.
   * @param url The URL of the account.
   * @returns A promise that resolves with the added source.
   */
  public async add (platform: SocialsPlatforms, url: string): Promise<Socials>;
  /**
   * Adds a membership to the organization.
   * @param membership The membership to add.
   * @returns A promise that resolves with the new membership.
   */
  public async add (membership: Membership, sources: string[]): Promise<void>;
  public async add (v: string|SocialsPlatforms|Membership, v2?: string|string[]): Promise<void|OrganSource|Socials> {
    if (typeof v === 'string') return await super.add(v);
    if (typeof v === 'number' && typeof v2 === 'string') return await super.add(v, v2);
    if (v instanceof Membership && typeof v2 === 'object') return await v.create(v2);
    throw new Error('Invalid argument type');
  }

  /**
   * Updates the organization in the database.
   * @returns A promise that resolves when the organization has been updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a membership for this organization.
   * @param membership The membership to update.
   * @returns A promise that resolves when the membership has been updated.
   */
  public async update (membership: Membership): Promise<void>;
  /**
   * Updates a membership source for this organization.
   * @param membership The membership to update.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (membership: Membership, source: MembershipSource): Promise<void>;
  public async update (v?: Membership, v2?: MembershipSource): Promise<void> {
    if (v instanceof Membership && v2 instanceof MembershipSource) return await v.update(v2);
    if (v instanceof Membership) return await v.update();
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
   * Removes a source from the organization.
   * @param source The source to remove.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (source: OrganSource): Promise<void>;
  /**
   * Removes a membership from the organization.
   * @param membership The membership to remove.
   * @returns A promise that resolves when the membership has been removed.
   */
  public async remove (membership: Membership): Promise<void>;
  public async remove (v?: OrganSource|Membership): Promise<void> {
    if (v instanceof OrganSource) return await super.remove(v);
    if (v instanceof Membership) return await v.remove();
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
    ORGANIZATION_CACHE.set(this.id, null);
  }

  /**
   * Returns all members of the organization.
   * @returns A promise that resolves with all members for the organization.
   */
  public async getMembers (): Promise<Membership[]> {
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
    if (typeof v === 'undefined') return await super.create();
    if (typeof v === 'string' && typeof v2 === 'undefined') return await super.create(v);
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
    if (!ORGANIZATION_CACHE.has(id)) {
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
    return ORGANIZATION_CACHE.get(id)!;
  }

  /**
   * Get a random organization.
   * @returns A promise that resolves with a random organization.
   */
  public static async getRandom (): Promise<Organization|null> {
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
