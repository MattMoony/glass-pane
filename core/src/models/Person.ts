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

  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'UPDATE person SET firstname = $1, lastname = $2, birthdate = $3, deathdate = $4 WHERE pid = $5',
      [this.firstname, this.lastname, this.birthdate, this.deathdate, this.id],
    );
    client.release();
  }

  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'DELETE FROM person WHERE pid = $1',
      [this.id],
    );
    client.release();
  }

  public async addRelation (relationType: string, person: Person, source: string, since: Date, until?: Date): Promise<void> {
    const client = await pool.connect();

    const relType = await client.query(
      'SELECT * FROM relation_type WHERE name = $1',
      [relationType],
    );
    if (!relType.rows.length) return;

    await client.query(
      'INSERT INTO relation (person, relative, relation, since, until) VALUES ($1, $2, $3, $4, $5)',
      [this.id, person.id, relType.rows[0].rtid, since, until],
    );

    await client.query(
      'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4)',
      [this.id, person.id, since, source,],
    );

    client.release();
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

  public static async find (query: string): Promise<Person[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   *
      FROM      person
      WHERE     LOWER(firstname)||' '||LOWER(lastname) LIKE $1
                OR LOWER(lastname)||' '||LOWER(firstname) LIKE $1`,
      [`%${query}%`],
    );
    client.release();
    return res.rows.map((row) => new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ));
  }
}

export default Person;
