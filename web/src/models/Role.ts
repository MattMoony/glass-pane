import * as role from '@/api/role';

/**
 * Represents a role that a member of an organization can have.
 */
class Role implements role.Role {
  /**
   * The ID of the role. This is unique across all roles.
   */
  public id: number;
  /**
   * The name of the role.
   */
  public name: string;

  public constructor (id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Converts the role to a JSON object.
   * @returns The JSON object representing the role.
   */
  public json (): role.Role {
    return {
      id: this.id,
      name: this.name,
    };
  }

  /**
   * Converts the role to a string.
   * @returns The string representation of the role.
   */
  public toString (): string {
    return `"${this.name}" (Role#${this.id})`;
  }

  /**
   * Creates a new role with the given name.
   * @param name The name of the role.
   * @returns A promise that resolves to the new role.
   */
  public static async create (name: string): Promise<Role|null> {
    const res = await role.create(name);
    return res.role ? new Role(res.role.id, res.role.name) : null;
  }

  /**
   * Searches for roles with the given name.
   * @param name The name of the role to search for.
   * @returns A promise that resolves to the roles with the given name.
   */
  public static async search (name: string): Promise<Role[]> {
    const res = await role.search(name);
    return res.roles.map(r => new Role(r.id, r.name));
  }

  /**
   * Gets the role with the given ID.
   * @param id The ID of the role to get.
   * @returns A promise that resolves to the role with the given ID, or null if no such role exists.
   */
  public static async get (id: number): Promise<Role|null> {
    const res = await role.get(id);
    return res.role ? new Role(res.role.id, res.role.name) : null;
  }

  /**
   * Updates the role.
   * @returns A promise that resolves when the role has been updated.
   */
  public async update (): Promise<void> {
    const res = await role.update(this.id, this.name);
    this.name = res.role?.name ?? this.name;
  }

  /**
   * Removes the role.
   * @returns A promise that resolves when the role has been removed.
   */
  public async remove (): Promise<void> {
    await role.remove(this.id);
  }
}

export default Role;
