import * as auth from '@/api/auth';

/**
 * Represents a user.
 */
class User implements auth.User {
  /**
   * The user's ID.
   */
  public id: number;
  /**
   * The user's username.
   */
  public username: string;
  /**
   * The user's token.
   */
  public token: string;

  constructor(id: number, username: string, token: string) {
    this.id = id;
    this.username = username;
    this.token = token;
  }

  /**
   * Converts the user to a JSON object.
   * @returns The JSON object representing the user.
   */
  public json(): auth.User {
    return {
      id: this.id,
      username: this.username,
      token: this.token,
    };
  }

  /**
   * Checks if the user is authenticated.
   * @returns A promise that resolves to true if the user is authenticated, false otherwise.
   */
  public async authenticated (): Promise<boolean> {
    return this.token !== null && (await auth.status(this.token)).success;
  }

  /**
   * Logs the user in.
   * @param username The username of the user.
   * @param password The password of the user.
   * @returns A promise that resolves to the user if the login was successful, null otherwise.
   */
  public static async login (username: string, password: string): Promise<User|null> {
    const res = await auth.login(username, password);
    if (!res.user) return null;
    const user = new User(res.user.id, res.user.username, res.user.token);
    // TODO: change auth to use HTTP-only cookies in future
    localStorage.setItem('user', JSON.stringify(user.json()));
    return user;
  }

  /**
   * Restores the user from a JSON object.
   * @param json The JSON object representing the user.
   * @returns A promise that resolves to the user.
   */
  public static fromJSON (json: auth.User): User {
    return new User(json.id, json.username, json.token);
  }
}

export default User;
