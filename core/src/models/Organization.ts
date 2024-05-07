import { pool } from '../db';

import Organ, { OrganSource } from './Organ';
import Role from './Role';

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
      'UPDATE membership_sources SET url = $1 WHERE sid = $2',
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
      'DELETE FROM membership_sources WHERE sid = $1',
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
      'INSERT INTO membership_sources (organ, organization, role, since, url) VALUES ($1, $2, $3, $4, $5) RETURNING sid',
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
      'SELECT url FROM membership_sources WHERE sid = $1',
      [sid]
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new MembershipSource(sid, res.rows[0].url);
  }
}

/**
 * Represents a membership in an organization.
 */
class Membership {
  public organ: Organ;
  public organization: Organization;
  public role: Role;
  public since: Date;
  public until?: Date;

  public constructor (organ: Organ, organization: Organization, role: Role, since: Date, until?: Date) {
    this.organ = organ;
    this.organization = organization;
    this.role = role;
    this.since = since;
    this.until = until;
  }

  /**
   * Returns a JSON representation of the membership.
   * @returns The JSON representation of the membership.
   */
  public json (): Object {
    return {
      organ: this.organ.json(),
      organization: this.organization.json(),
      role: this.role.json(),
      since: this.since.toISOString(),
      until: this.until?.toISOString(),
    };
  }

  /**
   * Returns a string representation of the membership.
   * @returns The string representation of the membership.
   */
  public toString (): string {
    return `${this.organ} in ${this.organization} as ${this.role} (${this.since.toISOString()}${this.until ? ` - ${this.until.toISOString()}` : ''})`;
  }

  /**
   * Store the membership in the database.
   * @param sources The sources of the membership.
   * @returns A promise that resolves when the membership has been stored.
   */
  public async create (sources: string[]): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'INSERT INTO membership (organ, organization, role, since, until) VALUES ($1, $2, $3, $4, $5)',
      [this.organ.id, this.organization.id, this.role.id, this.since, this.until]
    );
    await client.query(
      'INSERT INTO membership_sources (organ, organization, role, since, url) VALUES ($1, $2, $3, $4, $5)',
      sources.map(s => [this.organ.id, this.organization.id, this.role.id, this.since, s])
    );
    client.release();
  }

  /**
   * Adds a source to the membership.
   * @param source The source to add.
   * @returns A promise that resolves with the new source.
   */
  public async add (source: string): Promise<MembershipSource>;
  public async add (v: string): Promise<MembershipSource> {
    if (typeof v === 'string') return await MembershipSource.create(this, v);
    throw new Error('Invalid argument type');
  }

  /**
   * Updates the membership in the database.
   * @returns A promise that resolves when the membership has been updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a source for this membership.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (source: MembershipSource): Promise<void>;
  public async update (v?: MembershipSource): Promise<void> {
    if (v instanceof MembershipSource) return v.update();
    const client = await pool.connect();
    await client.query(
      'UPDATE membership SET until = $1 WHERE organ = $2 AND organization = $3 AND role = $4 AND since = $5',
      [this.until, this.organ.id, this.organization.id, this.role.id, this.since]
    );
    client.release();
  }

  /**
   * Removes the membership from the database.
   * @returns A promise that resolves when the membership has been removed.
   */
  public async remove (): Promise<void>;
  /**
   * Removes a source from the membership.
   * @param source The source to remove.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (source: MembershipSource): Promise<void>;
  public async remove (v?: MembershipSource): Promise<void> {
    if (v instanceof MembershipSource) return v.remove();
    const client = await pool.connect();
    await client.query(
      'DELETE FROM membership_sources WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [this.organ.id, this.organization.id, this.role.id, this.since]
    );
    await client.query(
      'DELETE FROM membership WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [this.organ.id, this.organization.id, this.role.id, this.since]
    );
    client.release();
  }

  /**
   * Gets a membership by its organ, organization, role and since date.
   * @param organ The organ of the membership.
   * @param organization The organization of the membership.
   * @param role The role of the membership.
   * @param since The since date of the membership.
   * @returns A promise that resolves with the membership, or null if it doesn't exist.
   */
  public static async get (organ: Organ, organization: Organization, role: Role, since: Date): Promise<Membership|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT until FROM membership WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [organ.id, organization.id, role.id, since]
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new Membership(organ, organization, role, since, res.rows[0].until);
  }
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

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date) {
    super(id, bio);
    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
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
   * Adds a membership to the organization.
   * @param membership The membership to add.
   * @returns A promise that resolves with the new membership.
   */
  public async add (membership: Membership, sources: string[]): Promise<void>;
  public async add (v: string|Membership, v2?: string[]): Promise<void|OrganSource> {
    if (typeof v === 'string') return await super.add(v);
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
      'UPDATE organizations SET name = $1, established = $2, dissolved = $3 WHERE id = $4',
      [this.name, this.established, this.dissolved, this.id]
    );
    client.release();
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
      'DELETE FROM organizations WHERE id = $1',
      [this.id]
    );
    client.release();
    super.remove();
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
   * @param established The date the organization was established.
   * @param dissolved The date the organization was dissolved.
   * @returns A promise that resolves with the new organization.
   */
  public static async create (name: string, established?: Date, dissolved?: Date, bio?: string): Promise<Organization>;
  public static async create (v?: string, v2?: Date, v3?: Date, v4?: string): Promise<Organ|Organization> {
    if (typeof v === 'undefined') return await super.create();
    if (typeof v === 'string' && typeof v2 === 'undefined') return await super.create(v);
    if (typeof v === 'string' && v2 instanceof Date && v3 instanceof Date && typeof v4 === 'string') {
      const organ = v4 ? await Organ.create(v4) : await super.create();
      const client = await pool.connect();
      const res = await client.query(
        'INSERT INTO organizations (id, name, established, dissolved) VALUES ($1, $2, $3, $4) RETURNING id',
        [organ.id, v, v2, v3]
      );
      client.release();
      return new Organization(organ.id, organ.bio, v, v2, v3);
    }
    throw new Error('Invalid creation type');
  }

  /**
   * Gets an organization by its ID.
   * @param id The ID of the organization.
   * @returns A promise that resolves with the organization, or null if it doesn't exist.
   */
  public static async get (id: number): Promise<Organization|null> {
    const organ = await super.get(id);
    if (!organ) return null;
    const client = await pool.connect();
    const res = await client.query(
      'SELECT name, established, dissolved FROM organizations WHERE id = $1', 
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

  /**
   * Finds organizations by their name.
   * @param query The name to search for.
   * @returns A promise that resolves with the organizations found.
   */
  public static async find (query: string): Promise<Organization[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   *
       FROM     organizations
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
