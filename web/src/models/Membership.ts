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
  public since: Date;
  /**
   * The date that the organ stopped being a member of the organization.
   */
  public until?: Date;

  public constructor (organ: Organ, organization: Organization, role: Role, since: Date, until?: Date) {
    this.organ = organ;
    this.organization = organization;
    this.role = role;
    this.since = since;
    this.until = until;
  }

  /**
   * Converts the membership to a JSON object.
   * @returns The JSON object representing the membership.
   */
  public json (): organ.Membership {
    return {
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
      return res.members.map((m: any) => new Membership(
        (m.organ as person.Person).firstname !== undefined
        ? new Person(
            m.organ.id,
            m.organ.bio,
            m.organ.firstname, 
            m.organ.lastname, 
            m.organ.birthdate,
            m.organ.deathdate
          )
        : new Organization(
            m.organ.id, 
            m.organ.bio, 
            m.organ.name, 
            m.organ.established, 
            m.organ.dissolved
          ),
        v,
        new Role(
          m.role.id, 
          m.role.name
        ),
        new Date(m.since),
        m.until ? new Date(m.until) : undefined
      ));
    }
    else if (v instanceof Organ) {
      const res = await organ.memberships(v.id);
      return res.memberships.map((m: any) => new Membership(
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
        new Date(m.since),
        m.until ? new Date(m.until) : undefined
      ));
    }
    return [];
  }
}

export default Membership;
