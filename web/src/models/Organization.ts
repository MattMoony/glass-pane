import * as organ from '@/api/organ';
import * as person from '@/api/person';
import * as organization from '@/api/organization';

import Organ, { type OrganCache } from './Organ';
import type Membership from './Membership';
import type Person from './Person';
import { Mutex } from 'async-mutex';
import Role from './Role';

export interface OrganizationCache extends OrganCache {
  members?: Membership[];
}

/**
 * Represents an organization.
 */
class Organization extends Organ implements organization.Organization {
  /**
   * The name of the organization.
   */
  public name: string;
  /**
   * The date the organization was established.
   */
  public established?: Date;
  /**
   * The date the organization was dissolved.
   */
  public dissolved?: Date;

  /**
   * The members of the organization.
   */
  public members: {
    /**
     * Gets the members of the organization.
     * @param refresh Whether to refresh the cache.
     * @returns The members of the organization.
     */
    get: (refresh?: boolean) => Promise<Membership[]>;
    /**
     * Adds a member to the organization.
     * @param membership The membership to add.
     * @param sources The sources for the membership.
     * @returns A promise that resolves when the member has been added.
     */
    add: (membership: Membership, sources: string[]) => Promise<void>;
    /**
     * Updates the membership of a member in the organization.
     * @param membership The membership to update.
     * @returns A promise that resolves when the membership has been updated.
     */
    update: (membership: Membership) => Promise<void>;
    /**
     * Removes a member from the organization.
     * @param membership The membership to remove.
     * @returns A promise that resolves when the member has been removed.
     */
    remove: (membership: Membership) => Promise<void>;
  }

  /**
   * The mutex for the members of the organization.
   */
  private members_mutex = new Mutex();

  /**
   * The cache for the organization.
   */
  protected cache: OrganizationCache = {};

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date) {
    super(id, bio);

    this.name = name;
    this.established = established;
    this.dissolved = dissolved;

    this.members = {
      get: async (refresh?: boolean) => {
        const release = await this.members_mutex.acquire();
        if (refresh || !this.cache.members) {
          const Person = (await import('./Person')).default;
          const Membership = (await import('./Membership')).default;
          const res = await organization.members(this.id);
          this.cache.members = res.members.map((m: organ.OrganizationMember) => new Membership(
            m.id,
            (m.organ as person.Person).firstname !== undefined
            ? new Person(
                m.organ.id,
                m.organ.bio,
                (m.organ as Person).firstname, 
                (m.organ as Person).lastname, 
                (m.organ as Person).birthdate,
                (m.organ as Person).deathdate
              )
            : new Organization(
                m.organ.id, 
                m.organ.bio, 
                (m.organ as Organization).name, 
                (m.organ as Organization).established, 
                (m.organ as Organization).dissolved
              ),
            this,
            new Role(
              m.role.id, 
              m.role.name
            ),
            m.since ? new Date(m.since) : undefined,
            m.until ? new Date(m.until) : undefined
          ));
        }
        release();
        return this.cache.members;
      },
      add: async (membership: Membership, sources: string[]) => {
        await organ.memberships.add(
          sources,
          membership.organ,
          this,
          membership.role,
          membership.since,
          membership.until
        );
      },
      update: async (membership: Membership) => {
        await organ.memberships.update(
          membership.organ,
          membership.id,
          membership.role,
          membership.since,
          membership.until
        );
      },
      remove: async (membership: Membership) => {
        await organ.memberships.remove(membership.organ, membership.id);
      },
    };
  }

  /**
   * Converts the organization to a JSON object.
   * @returns The JSON object representing the organization.
   */
  public json (): organization.Organization {
    return {
      ...super.json(),
      name: this.name,
      established: this.established,
      dissolved: this.dissolved,
    };
  }

  /**
   * Converts the organization to a string.
   * @returns The string representation of the organization.
   */
  public toString (): string {
    return `"${this.name}" (Organization#${this.id})`;
  }

  public get fullName (): string {
    return this.name;
  }

  /**
   * Updates the organization.
   * @returns A promise that resolves when the organization has been updated.
   */
  public async update (): Promise<void> {
    await organization.update(this.id, this.name, this.bio, this.established, this.dissolved);
  }

  /**
   * Gets an organization by its ID.
   * @param id The ID of the organization to get.
   * @returns A promise that resolves to the organization with the given ID, or null if no such organization exists.
   */
  public static async get (id: number): Promise<Organization|null> {
    const res = await organization.get(id);
    if (!res.organization) return null;

    return new Organization(
      res.organization.id,
      res.organization.bio,
      res.organization.name,
      res.organization.established,
      res.organization.dissolved,
    );
  }

  /**
   * Creates a new organization.
   * @param name The name of the organization.
   * @param bio The bio of the organization.
   * @param established The date the organization was established.
   * @param dissolved The date the organization was dissolved.
   * @returns A promise that resolves to the new organization, or null if the organization could not be created.
   */
  public static async create (
    name: string, 
    bio: string,
    established?: Date, 
    dissolved?: Date
  ): Promise<Organization|null> {
    const res = await organization.create(name, bio, established, dissolved);
    return res.organization ? new Organization(
      res.organization.id,
      bio,
      name,
      established,
      dissolved,
    ) : null;
  }

  /**
   * Searches for organizations by name.
   * @param query The query to search for.
   * @returns A promise that resolves to the organizations that match the query.
   */
  public static async search (query: string): Promise<Organization[]> {
    const res = await organization.search(query);
    return res.organizations.map(org => new Organization(
      org.id,
      org.bio,
      org.name,
      org.established,
      org.dissolved,
    ));
  }
}

export default Organization;
