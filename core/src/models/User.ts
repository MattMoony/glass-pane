import { pool } from '../db';
import { scrypt } from 'crypto';

/**
 * Represents a user in the system.
 */
class User {
  public id: number;
  public username: string;
  public password: {
    hash: string;
    salt: string;
  };

  constructor(id: number, username: string, password: { hash: string, salt: string }) {
    this.id = id;
    this.username = username;
    this.password = password;
  }

  /**
   * Converts the user to a JSON object.
   * @param unsanitized Whether to include sensitive information.
   * @returns The user as a JSON object.
   */
  public json (unsanitized?: boolean) {
    return {
      id: this.id,
      username: this.username,
      ...(unsanitized ? { password: this.password } : {}),
    }
  }

  /**
   * Authenticates a user.
   * @param password The password to authenticate with.
   * @returns Whether the user was authenticated.
   */
  public async auth (password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      scrypt(password, Buffer.from(this.password.salt, 'hex'), 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === this.password.hash);
      });
    });
  }

  /**
   * Fetches a user by their username.
   * @param username The username of the user to fetch.
   * @returns The user, or null if no user was found.
   */
  public static async get (username: string): Promise<User|null>;
  /**
   * Fetches a user by their ID.
   * @param id The ID of the user to fetch.
   * @returns The user, or null if no user was found.
   */
  public static async get (id: number): Promise<User|null>;
  public static async get (v: number|string): Promise<User|null> {
    if (typeof v === 'number') {
      const { rows } = await pool.query('SELECT * FROM users WHERE uid = $1', [v]);
      if (!rows.length) return null;
      const user = rows[0];
      return new User(+user.uid, user.username, { salt: user.password.split('$')[0], hash: user.password.split('$')[1], });
    } else {
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [v]);
      if (!rows.length) return null;
      const user = rows[0];
      return new User(+user.uid, user.username, { salt: user.password.split('$')[0], hash: user.password.split('$')[1], });
    }
  }
}

export default User;
