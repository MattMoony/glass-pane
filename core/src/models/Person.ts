import { pool } from '../db';

import Organ, { OrganSource } from './Organ';
import RelationType from './RelationshipType';

export class RelationSource {
  sid: number;
  url: string;

  public constructor (sid: number, url: string) {
    this.sid = sid;
    this.url = url;
  }

  /**
   * Get the JSON representation of this relation source.
   * @returns {Object} The JSON representation of this relation source.
   */
  public json (): Object {
    return {
      sid: this.sid,
      url: this.url,
    };
  }

  /**
   * Get the string representation of this relation source.
   * @returns {string} The string representation of this relation source.
   */
  public toString (): string {
    return `RelationSource#${this.sid} (${this.url})`;
  }

  /**
   * Update this relation source in the database.
   * @returns {Promise<void>} A promise that resolves when the source is updated.
   */
  public async update (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'UPDATE relation_source SET url = $1 WHERE sid = $2',
      [this.url, this.sid],
    );
    client.release();
  }

  /**
   * Remove this relation source from the database.
   * @returns {Promise<void>} A promise that resolves when the source is removed.
   */
  public async remove (): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'DELETE FROM relation_source WHERE sid = $1',
      [this.sid],
    );
    client.release();
  }

  /**
   * Get a relation source from the database.
   * @param {number} sid The ID of the source to get.
   * @returns {Promise<RelationSource|null>} A promise that resolves with the source, or null if not found.
   */
  public static async get (sid: number): Promise<RelationSource|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM relation_source WHERE sid = $1',
      [sid],
    );
    client.release();
    if (res.rows.length === 0) return null;
    return new RelationSource(sid, res.rows[0].url);
  }

  /**
   * Create a new relation source in the database.
   * @param {Relation} relation The relation to add the source to.
   * @param {string} url The URL of the source.
   * @returns {Promise<RelationSource>} A promise that resolves with the created source.
   */
  public static async create (relation: Relation, url: string): Promise<RelationSource> {
    const client = await pool.connect();
    const res = await client.query(
      'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4) RETURNING sid',
      [relation.from.id, relation.to.id, relation.since, url],
    );
    client.release();
    return new RelationSource(+res.rows[0].sid, url);
  }
}

/**
 * Represents a relation between two persons.
 */
export class Relation {
  type: RelationType;
  from: Person;
  to: Person;
  since: Date;
  until?: Date;

  public constructor (type: RelationType, from: Person, to: Person, since: Date, until?: Date) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.since = since;
    this.until = until;
  }

  /**
   * Get the JSON representation of this relation.
   * @param {boolean} abbrev Whether to abbreviate the JSON representation.
   * @returns {Object} The JSON representation of this relation.
   */
  public json (abbrev?: boolean): Object {
    return {
      ...(!abbrev ? {type: RelationType[this.type].toLowerCase(), from: this.from.json(),} : {}),
      to: this.to.json(),
      since: this.since.toISOString(),
      until: this.until?.toISOString(),
    };
  }

  /**
   * Get the string representation of this relation.
   * @returns {string} The string representation of this relation.
   */
  public toString(): string {
    return `${this.from.toString()} -[${RelationType[this.type]} ${this.since.toISOString()}]-> ${this.to.toString()}`;
  }

  /**
   * Create a new relation in the database.
   * @param {string[]} sources The sources of the relation.
   * @returns {Promise<void>} A promise that resolves when the relation is created.
   */
  public async create (sources: string[]): Promise<void> {
    const client = await pool.connect();
    await client.query(
      'INSERT INTO relation (person, relative, relation, since, until) VALUES ($1, $2, $3, $4, $5)',
      [this.from.id, this.to.id, this.type, this.since, this.until],
    );

    await client.query(
      'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4)',
      sources.map(s => [this.from.id, this.to.id, this.since, s,]),
    );
    client.release();
  }

  /**
   * Add a source to this relation.
   * @param {string} source The source to add.
   */
  public async add (source: string): Promise<RelationSource>;
  public async add (v: string): Promise<RelationSource> {
    if (typeof v === 'string') return await RelationSource.create(this, v);
    throw new Error('Invalid argument type');
  }

  /**
   * Update this relation in the database.
   * @returns {Promise<void>} A promise that resolves when the relation is updated.
   */
  public async update (): Promise<void>;
  /**
   * Update a source of this relation.
   * @param {RelationSource} source The source to update.
   * @returns {Promise<void>} A promise that resolves when the source is updated.
   */
  public async update (source: RelationSource): Promise<void>;
  public async update (v?: RelationSource): Promise<void> {
    if (v instanceof RelationSource) return await v.update();
    const client = await pool.connect();
    await client.query(
      'UPDATE relation SET until = $1 WHERE person = $2 AND relative = $3 AND since = $4',
      [this.until, this.from.id, this.to.id, this.since],
    );
    client.release();
  }

  /**
   * Remove this relation from the database.
   * @returns {Promise<void>} A promise that resolves when the relation is removed.
   */
  public async remove (): Promise<void>;
  /**
   * Remove a source from this relation.
   * @param {RelationSource} source The source to remove.
   * @returns {Promise<void>} A promise that resolves when the source is removed.
   */
  public async remove (source: RelationSource): Promise<void>;
  public async remove (v?: RelationSource): Promise<void> {
    if (v instanceof RelationSource) return await v.remove();
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
      [this.from.id, this.to.id, this.since],
    );

    await client.query(
      `DELETE FROM relation
      WHERE       person = $1
                  AND relative = $2
                  AND since = $3`,
      [this.from.id, this.to.id, this.since],
    );
    client.release();
  }

  /**
   * Get a relation from the database.
   * @param {Person} person The first person in the relation.
   * @param {Person} relative The second person in the relation.
   * @param {Date} since The date the relation started.
   * @returns {Promise<Relation|null>} A promise that resolves with the relation, or null if not found.
   */
  public static async get (person: Person, relative: Person, since: Date): Promise<Relation|null> {
    // TODO: I think I should really work on / update this schema, idk about this... lmao
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM relation WHERE (person = $1 AND relative = $2) AND since = $3',
      [person.id, relative.id, since],
    );
    if (res.rows.length === 1) {
      client.release();
      return new Relation(res.rows[0].relation, person, relative, since, res.rows[0].until);
    }
    const res2 = await client.query(
      'SELECT * FROM relation WHERE (person = $2 AND relative = $1) AND since = $3',
      [person.id, relative.id, since],
    );
    client.release();
    if (res2.rows.length === 0) return null;
    return new Relation(res.rows[0].relation, relative, person, since, res2.rows[0].until);
  }

  /**
   * Get all sources for this relation.
   * @param {Person} person The first person in the relation.
   * @param {Person} relative The second person in the relation.
   * @param {Date} since The date the relation started.
   * @returns {Promise<RelationSource[]>} A promise that resolves with the sources of the relation.
   */
  public static async sources (person: Person, relative: Person, since: Date): Promise<RelationSource[]> {
    const client = await pool.connect();
    const res = await client.query(
      `SELECT   sid, url
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
    if (res.rows.length === 0) return [];
    return res.rows.map((row) => new RelationSource(+row.sid, row.url));
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
   * Remove a relation from this person.
   * @param {Relation} relation The relation to remove.
   * @returns {Promise<void>} A promise that resolves when the relation is removed.
   */
  public async remove (relation: Relation): Promise<void>;
  public async remove (v?: Relation): Promise<void> {
    if (v instanceof Relation) return await v.remove();
    const client = await pool.connect();
    await client.query(
      'DELETE FROM person WHERE pid = $1',
      [this.id],
    );
    client.release();
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
      WHERE     LOWER(firstname)||' '||LOWER(lastname) LIKE $1
                OR LOWER(lastname)||' '||LOWER(firstname) LIKE $1`,
      [`%${query}%`],
    );
    client.release();
    return Promise.all(res.rows.map(async (row) => new Person(
      +row.pid,
      (await Organ.get(row.pid))!.bio,
      row.firstname,
      row.lastname,
      row.birthdate,
      row.deathdate,
    )));
  }
}

export default Person;
