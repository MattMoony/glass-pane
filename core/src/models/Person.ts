import Organ from './Organ';
import { pool } from '../db';

const RELATION_TYPES: { [name: string]: number, } = {
  'parent': 1,
  'romantic': 2,
  'friend': 3,
};

/**
 * Represents a relation between two persons.
 */
export class Relation {
  from: Person;
  to: Person;
  since: Date;
  until?: Date;

  public constructor (from: Person, to: Person, since: Date, until?: Date) {
    this.from = from;
    this.to = to;
    this.since = since;
    this.until = until;
  }

  public json (nofrom?: boolean): Object {
    return {
      ...(!nofrom ? {from: this.from.json()} : {}),
      to: this.to.json(),
      since: this.since.toISOString(),
      until: this.until?.toISOString(),
    };
  }

  public toString(): string {
    return `${this.from.toString()} -[${this.since.toISOString()}]-> ${this.to.toString()}`;
  }

  public static async getSource (person: Person, relative: Person, since: Date): Promise<string|null> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   url
      FROM      relation_source
      WHERE     person = $1
                AND relative = $2
                AND since = $3`,
      [person.id, relative.id, since],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return res.rows[0].url;
  }
}

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

    if (!(relationType in RELATION_TYPES)) return;

    await client.query(
      'INSERT INTO relation (person, relative, relation, since, until) VALUES ($1, $2, $3, $4, $5)',
      [this.id, person.id, RELATION_TYPES[relationType], since, until],
    );

    await client.query(
      'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4)',
      [this.id, person.id, since, source,],
    );

    client.release();
  }

  public async getParents (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['parent']],
    );
    client.release();
    return res.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until));
  }

  public async getChildren (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['parent']],
    );
    client.release();
    return res.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until));
  }

  public async getRomantic (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['romantic']],
    );
    const ret = res.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until));
    const res2 = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['romantic']],
    );
    return ret.concat(res2.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
  }

  public async getFriends (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['friend']],
    );
    const ret = res.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until));
    const res2 = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['friend']],
    );
    return ret.concat(res2.rows.map((row) => new Relation(this, new Person(
      row.pid,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
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
