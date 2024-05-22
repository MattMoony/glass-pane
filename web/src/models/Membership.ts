import * as organ from '@/api/organ';
import * as organization from '@/api/organization';
import * as person from '@/api/person';
import Organ from './Organ';
import Organization from './Organization';
import Person from './Person';
import Role from './Role';

/**
 * Represents a membership of an organization.
 */
class Membership {
  /**
   * The unique identifier of the membership.
   */
  public id: number;
  /**
   * The organ that is a member of the organization.
   */
  public organ: Organ;
  /**
   * The organization that the organ is a member of.
   */
  public organization: Organization;
  /**
   * The role that the organ has in the organization.
   */
  public role: Role;
  /**
   * The date that the organ became a member of the organization.
   */
  public since?: Date|null;
  /**
   * The date that the organ stopped being a member of the organization.
   */
  public until?: Date|null;

  public constructor (organ: Organ, organization: Organization, role: Role, since?: Date|null, until?: Date|null);
  public constructor (id: number, organ: Organ, organization: Organization, role: Role, since?: Date|null, until?: Date|null);
  public constructor (id: number|Organ, organ: Organ|Organization, organization: Organization|Role, role?: Role|Date|null, since?: Date|null, until?: Date|null) {
    if (typeof id === 'number') {
      this.id = id;
      this.organ = organ as Organ;
      this.organization = organization as Organization;
      this.role = role as Role;
      this.since = since;
      this.until = until;
    } else {
      this.id = -1;
      this.organ = id as Organ;
      this.organization = organ as Organization;
      this.role = organization as Role;
      this.since = role as Date;
      this.until = since;
    }
  }

  /**
   * Converts the membership to a JSON object.
   * @returns The JSON object representing the membership.
   */
  public json (): organ.Membership {
    return {
      id: this.id,
      organ: this.organ.json(),
      organization: this.organization.json(),
      role: this.role.json(),
      since: this.since,
      until: this.until,
    };
  }

  /**
   * Converts the membership to a string.
   * @returns The string representation of the membership.
   */
  public toString (): string {
    return `${this.organ} is a ${this.role} of ${this.organization}`;
  }

  /**
   * Creates a new membership.
   * @param sources The sources for the membership.
   * @returns A promise that resolves when the membership is created.
   */
  public async create (sources: string[]): Promise<void> {
    await organ.memberships.add(
      sources,
      this.organ,
      this.organization,
      this.role,
      this.since,
      this.until
    );
  }

  /**
   * Updates the membership.
   * @returns A promise that resolves when the membership is updated.
   */
  public async update (): Promise<void> {
    await organ.memberships.update(
      this.organ,
      this.id,
      this.role,
      this.since,
      this.until
    );
  }

  /**
   * Removes the membership.
   * @returns A promise that resolve when the membership has been deleted.
   */
  public async remove (): Promise<void> {
    await organ.memberships.remove(
      this.organ,
      this.id
    );
  }

  // TODO: could add a function for getting all memberships
  // TODO: of a specific organ in a specific organization
  /**
   * Gets the memberships of an organ.
   * @param organ The organ to get the memberships of.
   * @returns The memberships of the organ.
   */
  public static async get (organ: Organ): Promise<Membership[]>;
  /**
   * Gets all members of an organization.
   * @param organization The organization to get the members of.
   * @returns The members of the organization.
   */
  public static async get (organization: Organization): Promise<Membership[]>;
  /**
   * Gets a specific membership.
   * @param organ The organ that is a member of the organization.
   * @param organization The organization that the organ is a member of.
   * @param role The role that the organ has in the organization.
   * @param since The date that the organ became a member of the organization.
   * @returns The membership of the organ in the organization.
   */
  public static async get (organ: Organ, organization: Organization, role: Role, since: Date): Promise<Membership[]>;
  public static async get (v: Organ|Organization, v2?: Organization, v3?: Role, v4?: Date): Promise<Membership[]> {
    if (v instanceof Organization) {
      const res = await organization.members(v.id);
      return res.members.map((m: organ.OrganizationMember) => new Membership(
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
        v,
        new Role(
          m.role.id, 
          m.role.name
        ),
        m.since ? new Date(m.since) : undefined,
        m.until ? new Date(m.until) : undefined
      ));
    }
    else if (v instanceof Organ) {
      const res = await organ.memberships(v.id);
      return res.memberships.map((m: organ.OrganMembership) => new Membership(
        v,
        new Organization(
          m.organization.id, 
          m.organization.bio,
          m.organization.name,
          m.organization.established,
          m.organization.dissolved
        ),
        new Role(
          m.role.id, 
          m.role.name
        ),
        m.since ? new Date(m.since) : undefined,
        m.until ? new Date(m.until) : undefined
      ));
    }
    return [];
  }
}

export default Membership;
