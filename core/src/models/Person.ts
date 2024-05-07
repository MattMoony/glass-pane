import { pool } from '../db';

import Organ from './Organ';
import OrganSource from './OrganSource';
import RelationType from './RelationshipType';
import Relation from './Relation';
import RelationSource from './RelationSource';

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
  
  /**
   * Get the JSON representation of this person.
   * @returns {Object} The JSON representation of this person.
   */
  public json (): Object {
    return {
      ...super.json(),
      firstname: this.firstname,
      lastname: this.lastname,
      birthdate: this.birthdate?.toISOString(),
      deathdate: this.deathdate?.toISOString(),
    };
  }

  /**
   * Get the string representation of this person.
   * @returns {string} The string representation of this person.
   */
  public toString (): string {
    return `"${this.firstname} ${this.lastname}" (Person#${this.id})`;
  }

  /**
   * Add a source to this person.
   * @param {string} source The source to add.
   * @returns {Promise<OrganSource>} A promise that resolves when the source is added.
   */
  public async add (source: string): Promise<OrganSource>;
  /**
   * Add a relation to this person.
   * @param {Relation} relation The relation to add.
   * @param {string[]} sources The sources of the relation.
   * @returns {Promise<void>} A promise that resolves when the relation is added.
   */
  public async add (relation: Relation, sources: string[]): Promise<void>;
  public async add (v: Relation|string, v2?: string[]): Promise<void|OrganSource> {
    if (v instanceof Relation && typeof v2 === 'object') return await v.create(v2);
    if (typeof v === 'string') return await super.add(v);
    throw new Error('Invalid argument type');
  }

  /**
   * Update this person in the database.
   * @returns {Promise<void>} A promise that resolves when the person is updated.
   */
  public async update (): Promise<void>;
  /**
   * Update a relation of this person.
   * @param {Relation} relation The relation to update.
   * @returns {Promise<void>} A promise that resolves when the relation is updated.
   */
  public async update (relation: Relation): Promise<void>;
  /**
   * Update a relation source of this person.
   * @param {Relation} relation The relation to update.
   * @param {RelationSource} source The source of the relation.
   * @returns {Promise<void>} A promise that resolves when the relation is updated.
   */
  public async update (relation: Relation, source: RelationSource): Promise<void>;
  public async update (v?: Relation, v2?: RelationSource): Promise<void> {
    if (v instanceof Relation && v2 instanceof RelationSource) return await v.update(v2);
    else if (v instanceof Relation) return await v.update();
    await super.update();
    const client = await pool.connect();
    await client.query(
      'UPDATE person SET firstname = $1, lastname = $2, birthdate = $3, deathdate = $4 WHERE pid = $5',
      [this.firstname, this.lastname, this.birthdate, this.deathdate, this.id],
    );
    client.release();
  }


  /**
   * Remove this person from the database.
   * @returns {Promise<void>} A promise that resolves when the person is removed.
   */
  public async remove (): Promise<void>;
  /**
   * Remove a source for this person.
   * @param {OrganSource} source The source to remove.
   * @returns {Promise<void>} A promise that resolves when the source is removed.
   */
  public async remove (source: OrganSource): Promise<void>;
  /**
   * Remove a relation from this person.
   * @param {Relation} relation The relation to remove.
   * @returns {Promise<void>} A promise that resolves when the relation is removed.
   */
  public async remove (relation: Relation): Promise<void>;
  public async remove (v?: Relation|OrganSource): Promise<void> {
    if (v instanceof OrganSource) return await super.remove(v);
    if (v instanceof Relation) return await v.remove();
    const client = await pool.connect();
    await client.query(
      'DELETE FROM person WHERE pid = $1',
      [this.id],
    );
    client.release();
    super.remove();
  }

  /**
   * Get all parents of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The parents of this person.
   */
  public async getParents (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RelationType.PARENT],
    );
    client.release();
    return Promise.all(res.rows.map(async (row) => new Relation(RelationType.CHILD, this, new Person(
      +row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
  }

  /**
   * Get all children of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The children of this person.
   */
  public async getChildren (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.person
      WHERE     relation.relative = $1
                AND relation.relation = $2`,
      [this.id, RelationType.PARENT],
    );
    client.release();
    return Promise.all(res.rows.map(async (row) => new Relation(RelationType.PARENT, this, new Person(
      +row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until)));
  }

  /**
   * Get all romantic relationships of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The romantic relationships of this person.
   */
  public async getRomantic (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RelationType.ROMANTIC],
    );
    const ret = await Promise.all(res.rows.map(async (row) => new Relation(RelationType.ROMANTIC, this, new Person(
      +row.pid,
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
      [this.id, RelationType.ROMANTIC],
    );
    client.release();
    return ret.concat(await Promise.all(res2.rows.map(async (row) => new Relation(RelationType.ROMANTIC, this, new Person(
      +row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until))));
  }

  /**
   * Get all friends of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The friends of this person.
   */
  public async getFriends (): Promise<Relation[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   person.*, relation.since, relation.until
      FROM      relation
                INNER JOIN person ON person.pid = relation.relative
      WHERE     relation.person = $1
                AND relation.relation = $2`,
      [this.id, RelationType.FRIEND],
    );
    const ret = await Promise.all(res.rows.map(async (row) => new Relation(RelationType.FRIEND, this, new Person(
      +row.pid,
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
      [this.id, RelationType.FRIEND],
    );
    client.release();
    return ret.concat(await Promise.all(res2.rows.map(async (row) => new Relation(RelationType.FRIEND, this, new Person(
      +row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    ), row.since, row.until))));
  }

  /**
   * Create a new organ in the database.
   * @returns {Promise<Organ>} A promise that resolves with the created organ.
   */
  public static async create (): Promise<Organ>;
  /**
   * Create a new organ with a bio in the database.
   * @param {string} bio The biography of the organ.
   * @returns {Promise<Organ>} A promise that resolves with the created organ.
   */
  public static async create (bio: string): Promise<Organ>;
  /**
   * Create a new person in the database.
   * @param {string} firstname The first name of the person.
   * @param {string} lastname The last name of the person.
   * @param {Date} birthdate The birthdate of the person.
   * @param {Date} deathdate The deathdate of the person.
   * @param {string} bio The biography of the person.
   * @returns {Promise<Person>} A promise that resolves with the created person.
   */
  public static async create (firstname: string, lastname: string, birthdate?: Date, deathdate?: Date, bio?: string): Promise<Person>;
  public static async create (v?: string, v2?: string, v3?: Date, v4?: Date, v5?: string): Promise<Person|Organ> {
    if (v === undefined) return await super.create();
    if (typeof v === 'string' && v2 === undefined) return await super.create(v);
    if (typeof v === 'string' && typeof v2 === 'string' && v3 instanceof Date && v4 instanceof Date) {
      const organ = v5 ? await super.create(v5) : await super.create();
      const client = await pool.connect();
      await client.query(
        'INSERT INTO person (pid, firstname, lastname, birthdate, deathdate) VALUES ($1, $2, $3, $4, $5)',
        [organ.id, v, v2, v3, v4,],
      );
      client.release();
      return new Person(organ.id, organ.bio, v, v2, v3, v4);
    }
    throw new Error('Invalid argument types');
  }

  /**
   * Get a person from the database.
   * @param {number} id The ID of the person to get.
   * @returns {Promise<Person|null>} A promise that resolves with the person, or null if not found.
   */
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

  /**
   * Find persons by name.
   * @param {string} query The query to search for.
   * @returns {Promise<Person[]>} A promise that resolves with the found persons.
   */
  public static async find (query: string): Promise<Person[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   *
      FROM      person
      WHERE     firstname||' '||lastname ILIKE $1
                OR lastname||' '||firstname ILIKE $1`,
      [`%${query}%`],
    );
    client.release();
    return Promise.all(res.rows.map(async (row) => new Person(
      +row.pid,
      (await Organ.get(+row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    )));
  }
}

export default Person;
