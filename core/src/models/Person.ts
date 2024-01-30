import Organ from './Organ';
import { pool } from '../db';

/**
 * Represents a natural person.
 */
class Person extends Organ {
  public firstname: string;
  public lastname: string;
  public birthdate?: Date;
  public deathdate?: Date;

  public constructor (id: number, firstname: string, lastname: string, birthdate?: Date, deathdate?: Date) {
    super(id);
    this.firstname = firstname;
    this.lastname = lastname;
    this.birthdate = birthdate;
    this.deathdate = deathdate;
  }
  
  public json (): Object {
    return {
      ...super.json(),
      firstname: this.firstname,
      lastname: this.lastname,
      birthdate: this.birthdate?.toISOString(),
      deathdate: this.deathdate?.toISOString(),
    };
  }

  public toString (): string {
    return `"${this.firstname} ${this.lastname}" (Person#${this.id})`;
  }

  public static dummy (id?: number): Person {
    return new Person(
      id !== undefined ? id : 1234,
      'Max', 
      'Mustermann', 
      new Date(1930, 0, 1),
      new Date(2010, 0, 2),
    );
  }

  public static async create (firstname: string, lastname: string, birthdate?: Date, deathdate?: Date): Promise<Person> {
    const id = await Organ.create();
    const client = await pool.connect();
    await client.query(
      'INSERT INTO person (pid, firstname, lastname, birthdate, deathdate) VALUES ($1, $2, $3, $4, $5)',
      [id, firstname, lastname, birthdate, deathdate,],
    );
    client.release();
    return new Person(id, firstname, lastname, birthdate, deathdate);
  }

  public static async get (id: number): Promise<Person|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM person WHERE pid = $1',
      [id],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new Person(
      res.rows[0].pid,
      res.rows[0].firstname,
      res.rows[0].lastname,
      res.rows[0].birthdate,
      res.rows[0].deathdate,
    );
  }
}

export default Person;
