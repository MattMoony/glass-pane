import { pool } from '../db';

import Organ from './Organ';
import OrganSource from './OrganSource';
import Membership from './Membership';
import MembershipSource from './MembershipSource';

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
      'UPDATE organization SET name = $1, established = $2, dissolved = $3 WHERE oid = $4',
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
      'DELETE FROM organization WHERE oid = $1',
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
        'INSERT INTO organization (id, name, established, dissolved) VALUES ($1, $2, $3, $4) RETURNING oid',
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
