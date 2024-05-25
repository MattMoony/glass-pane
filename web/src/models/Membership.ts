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
}

export default Membership;
