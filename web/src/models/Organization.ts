import * as organization from '@/api/organization';

import Organ from './Organ';

/**
 * Represents an organization.
 */
class Organization extends Organ implements organization.Organization {
  public name: string;
  public established?: Date;
  public dissolved?: Date;

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date) {
    super(id, bio);

    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
  }

  public json (): organization.Organization {
    return {
      ...super.json(),
      name: this.name,
      established: this.established,
      dissolved: this.dissolved,
    };
  }

  public toString (): string {
    return `"${this.name}" (Organization#${this.id})`;
  }

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
}

export default Organization;
