import { pool } from '../db';

/**
 * Represents a role in an organization.
 */
class Role {
  public id: number;
  public name: string;

  public constructor (id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Returns a JSON representation of the role.
   * @returns The JSON representation of the role.
   */
  public json (): Object {
    return {
      id: this.id,
      name: this.name,
    };
  }

  /**
   * Returns a string representation of the role.
   * @returns The string representation of the role.
   */
  public toString (): string {
    return `"${this.name}" (Role#${this.id})`;
  }

  /**
   * Updates the role in the database.
   * @returns A promise that resolves when the role has been updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query('UPDATE role SET name = $1 WHERE rid = $2', [this.name, this.id]);
    client.release();
  }

  /**
   * Deletes the role from the database.
   * @returns A promise that resolves when the role has been deleted.
   */
  public async delete (): Promise<void> {
    const client = await pool.connect();
    await client.query('DELETE FROM role WHERE rid = $1', [this.id]);
    client.release();
  }

  /**
   * Gets a role from the database.
   * @param id The ID of the role to get.
   * @returns A promise that resolves with the role.
   */
  public static async get (id: number): Promise<Role|null> {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM role WHERE rid = $1', [id]);
    client.release();
    if (res.rowCount === 0) return null;
    return new Role(+res.rows[0].rid, res.rows[0].name);
  }

  /**
   * Finds roles by name.
   * @param name The name to search for.
   * @returns A promise that resolves with the roles.
   */
  public static async find (name: string): Promise<Role[]> {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM role WHERE name ILIKE $1', [`%${name}%`]);
    client.release();
    return res.rows.map(row => new Role(+row.rid, row.name));
  }

  /**
   * Creates a role.
   * @param name The name of the role to create.
   * @returns A promise that resolves with the created role.
   */
  public static async create (name: string): Promise<Role> {
    const client = await pool.connect();
    const res = await client.query('INSERT INTO role (name) VALUES ($1) RETURNING rid', [name]);
    client.release();
    return new Role(+res.rows[0].rid, name);
  }
}

export default Role;
