import { pool } from '../db';

import Organ from './Organ';
import OrganSource from './OrganSource';
import Role from './Role';
import Organization from './Organization';
import MembershipSource from './MembershipSource';

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
        'INSERT INTO membership_sources (organ, organization, role, since, url) VALUES ($1, $2, $3, $4, $5)',
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

export default Membership;
