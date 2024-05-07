import { pool } from '../db';

import Person from './Person';
import RelationType from './RelationshipType';
import RelationSource from './RelationSource';

/**
 * Represents a relation between two persons.
 */
class Relation {
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

    for (const source of sources) {
      await client.query(
        'INSERT INTO relation_source (person, relative, since, url) VALUES ($1, $2, $3, $4)',
        [this.from.id, this.to.id, this.since, source],
      );
    }
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

export default Relation;
