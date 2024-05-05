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
      WHERE     (person = $1
                AND relative = $2
                AND since = $3)
                OR
                (person = $2
                AND relative = $1
                AND since = $3)`,
      [person.id, relative.id, since],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return res.rows[0].url;
  }

  public static async remove (person: Person, relative: Person, since: Date): Promise<void> {
    const client = await pool.connect();

    await client.query(
      `DELETE FROM relation_source
      WHERE       (person = $1
                  AND relative = $2
                  AND since = $3)
                  OR
                  (person = $2
                  AND relative = $1
                  AND since = $3)`,
      [person.id, relative.id, since],
    );

    await client.query(
      `DELETE FROM relation
      WHERE       person = $1
                  AND relative = $2
                  AND since = $3`,
      [person.id, relative.id, since],
    );
    client.release();
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

  public constructor (id: number, bio: string, firstname: string, lastname: string, birthdate?: Date, deathdate?: Date) {
    super(id, bio);
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
    await super.update();
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

  public async updateRelation (relationType: string, person: Person, source: string, since: Date, until?: Date): Promise<void> {
    const client = await pool.connect();

    if (!(relationType in RELATION_TYPES)) return;

    await client.query(
      'UPDATE relation SET until = $1 WHERE person = $2 AND relative = $3 AND relation = $4 AND since = $5',
      [until, this.id, person.id, RELATION_TYPES[relationType], since],
    );

    console.log(source, this.id, person.id, since, typeof since)
    const res = await client.query(
      'UPDATE relation_source SET url = $1 WHERE person = $2 AND relative = $3 AND since = $4',
      [source, this.id, person.id, since],
    );
    console.log(res.rowCount)
    const res2 = await client.query(
      'SELECT * FROM relation_source WHERE person = $1 AND relative = $2 AND since = $3',
      [this.id, person.id, since.toISOString().split('T')[0]],
    );
    console.log(res2.rows)

    client.release();
  }

  public async removeRelation (relationType: string, person: Person, since: Date): Promise<void> {
    const client = await pool.connect();

    if (!(relationType in RELATION_TYPES)) return;

    await client.query(
      'DELETE FROM relation WHERE person = $1 AND relative = $2 AND relation = $3 AND since = $4',
      [this.id, person.id, RELATION_TYPES[relationType], since],
    );

    await client.query(
      'DELETE FROM relation_source WHERE person = $1 AND relative = $2 AND since = $3',
      [this.id, person.id, since],
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
    return Promise.all(res.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
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
    return Promise.all(res.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
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
    const ret = await Promise.all(res.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
    const res2 = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['romantic']],
    );
    client.release();
    return ret.concat(await Promise.all(res2.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until))));
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
    const ret = await Promise.all(res.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
    const res2 = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RELATION_TYPES['friend']],
    );
    client.release();
    return ret.concat(await Promise.all(res2.rows.map(async (row) => new Relation(this, new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until))));
  }

  public static async create (firstname: string, lastname: string, birthdate?: Date, deathdate?: Date, bio?: string): Promise<Person> {
    const id = await Organ.create();
    const client = await pool.connect();
    await client.query(
      'INSERT INTO person (pid, firstname, lastname, birthdate, deathdate) VALUES ($1, $2, $3, $4, $5)',
      [id, firstname, lastname, birthdate, deathdate,],
    );
    client.release();
    return new Person(id, bio||'', firstname, lastname, birthdate, deathdate);
  }

  public static async get (id: number): Promise<Person|null> {
    const organ = await super.get(id);
    if (!organ) return null;
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM person WHERE pid = $1',
      [id],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new Person(
      organ.id,
      organ.bio,
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
    return Promise.all(res.rows.map(async (row) => new Person(
      row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    )));
  }
}

export default Person;
