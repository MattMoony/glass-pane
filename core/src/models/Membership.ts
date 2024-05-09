import { pool } from '../db';

import Organ from './Organ';
import OrganSource from './OrganSource';
import Role from './Role';
import Organization from './Organization';
import MembershipSource from './MembershipSource';
import Person from './Person';

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
    for (const source of sources) {
      await client.query(
        'INSERT INTO membership_source (organ, organization, role, since, url) VALUES ($1, $2, $3, $4, $5)',
        [this.organ.id, this.organization.id, this.role.id, this.since, source]
      );
    }
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
      'DELETE FROM membership_source WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [this.organ.id, this.organization.id, this.role.id, this.since]
    );
    await client.query(
      'DELETE FROM membership WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [this.organ.id, this.organization.id, this.role.id, this.since]
    );
    client.release();
  }

  /**
   * Creates a new membership.
   * @param sources The sources of the membership.
   * @param organ The organ of the membership.
   * @param organization The organization of the membership.
   * @param role The role of the membership.
   * @param since The since date of the membership.
   * @param until The until date of the membership.
   * @returns A promise that resolves with the new membership.
   */
  public static async create (
    sources: string[], 
    organ: Organ, 
    organization: Organization, 
    role: Role, 
    since: Date, 
    until?: Date
  ): Promise<Membership> {
    const membership = new Membership(organ, organization, role, since, until);
    await membership.create(sources);
    return membership;
  }

  /**
   * Gets all memberships of an organ.
   * @param organ The organ to get memberships of.
   * @returns A promise that resolves with the memberships of the organ.
   */
  public static async get (organ: Organ): Promise<Membership[]>;
  /**
   * Gets all members of an organization.
   * @param organization The organization to get members of.
   * @returns A promise that resolves with the members of the organization.
   */
  public static async get (organization: Organization): Promise<Membership[]>;
  /**
   * Gets a membership by its organ, organization, role and since date.
   * @param organ The organ of the membership.
   * @param organization The organization of the membership.
   * @param role The role of the membership.
   * @param since The since date of the membership.
   * @returns A promise that resolves with the membership, or null if it doesn't exist.
   */
  public static async get (organ: Organ, organization: Organization, role: Role, since: Date): Promise<Membership|null>;
  public static async get (v: Organ|Organization, v2?: Organization, v3?: Role, v4?: Date): Promise<Membership|Membership[]|null> {
    if (v instanceof Organization) {
      const client = await pool.connect();
      const res = await client.query(
        'SELECT organ, role, since, until FROM membership WHERE organization = $1',
        [v.id]
      );
      client.release();
      const memberships = [];
      for (const row of res.rows) {
        let organ: Person|Organization|null = await Person.get(row.organ);
        if (!organ)
          organ = await Organization.get(row.organ);
        if (!organ)
          continue;
        const role = await Role.get(row.role);
        if (!organ || !role) continue;
        memberships.push(new Membership(organ, v, role, row.since, row.until));
      }
      return memberships;
    } else if (v instanceof Organ && !v2 && !v3 && !v4) {
      const client = await pool.connect();
      const res = await client.query(
        'SELECT organization, role, since, until FROM membership WHERE organ = $1',
        [v.id]
      );
      client.release();
      const memberships = [];
      for (const row of res.rows) {
        const organization = await Organization.get(row.organization);
        const role = await Role.get(row.role);
        if (!organization || !role) continue;
        memberships.push(new Membership(v, organization, role, row.since, row.until));
      }
      return memberships;
    }
    if (!(v instanceof Organ) || !(v2 instanceof Organization) || !(v3 instanceof Role) || !(v4 instanceof Date))
      throw new Error('Invalid argument types');
    const client = await pool.connect();
    const res = await client.query(
      'SELECT until FROM membership WHERE organ = $1 AND organization = $2 AND role = $3 AND since = $4',
      [v.id, v2.id, v3.id, v4]
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new Membership(v, v2, v3, v4, res.rows[0].until);
  }
}

export default Membership;
