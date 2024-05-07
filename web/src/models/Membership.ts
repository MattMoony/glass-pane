import * as organ from '@/api/organ';
import Organ from './Organ';
import Organization from './Organization';
import Role from './Role';

/**
 * Represents a membership of an organization.
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

  public json (): object {
    return {
      organ: this.organ.json(),
      organization: this.organization.json(),
      role: this.role.json(),
      since: this.since,
      until: this.until,
    };
  }

  public toString (): string {
    return `${this.organ} is a ${this.role} of ${this.organization}`;
  }

  public static async get (organ: Organ): Promise<Membership[]>;
  public static async get (organization: Organization): Promise<Membership[]>;
  public static async get (organ: Organ, organization: Organization, role: Role, since: Date): Promise<Membership[]>;
  public static async get (v: Organ|Organization, v2?: Organization, v3?: Role, v4?: Date): Promise<Membership[]> {
    if (v instanceof Organization) return [];
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
