import * as organization from '@/api/organization';

import Organ from './Organ';

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

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date) {
    super(id, bio);

    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
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
