import { pool } from '../db';

import Organ, { OrganCache } from './Organ';
import OrganSource from './OrganSource';
import RelationType from './RelationshipType';
import Relation from './Relation';
import RelationSource from './RelationSource';
import Socials from './Socials';
import SocialsPlatforms from './SocialsPlatforms';
import log from '../log/person';

/**
 * A cache of all organs in order not to overload the DB.
 */
const PERSON_CACHE: Map<number, Person|null> = new Map();

/**
 * Cache of a person.
 */
export interface PersonCache extends OrganCache {
  relations: {
    [RelationType.PARENT]?: Relation[];
    [RelationType.CHILD]?: Relation[];
    [RelationType.ROMANTIC]?: Relation[];
    [RelationType.FRIEND]?: Relation[];
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

  public _cache: PersonCache = { relations: {}, };

  public constructor (id: number, bio: string, firstname: string, lastname: string, birthdate?: Date, deathdate?: Date) {
    super(id, bio);
    this.firstname = firstname;
    this.lastname = lastname;
    this.birthdate = birthdate;
    this.deathdate = deathdate;
    this.cache();
  }
  
  public cache (): void {
    log.info(`Caching person ${this}`);
    PERSON_CACHE.set(this.id, this);
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
   * Adds a social media account to the organ.
   * @param platform The platform of the account.
   * @param url The URL of the account.
   * @returns A promise that resolves with the added source.
   */
  public async add (platform: SocialsPlatforms, url: string): Promise<Socials>;
  /**
   * Add a relation to this person.
   * @param {Relation} relation The relation to add.
   * @param {string[]} sources The sources of the relation.
   * @returns {Promise<void>} A promise that resolves when the relation is added.
   */
  public async add (relation: Relation, sources: string[]): Promise<void>;
  public async add (v: Relation|string|SocialsPlatforms, v2?: string|string[]): Promise<void|OrganSource|Socials> {
    if (v instanceof Relation && typeof v2 === 'object') return await v.create(v2);
    if (typeof v === 'string') return await super.add(v);
    if (typeof v === 'number' && typeof v2 === 'string') return await super.add(v, v2);
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
    this.cache();
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
    log.debug(`Nulling person cache ${this}`);
    PERSON_CACHE.set(this.id, null);
  }

  /**
   * Get all relations of this person.
   * @returns {Promise<Relation[]>} The relations of this person.
   */
  public async getRelations (): Promise<Relation[]> {
    const parents = await this.getParents();
    const children = await this.getChildren();
    const romantic = await this.getRomantic();
    const friends = await this.getFriends();
    return parents.concat(children).concat(romantic).concat(friends);
  }

  /**
   * Get all parents of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The parents of this person.
   */
  public async getParents (): Promise<Relation[]> {
    if (!this._cache.relations[RelationType.PARENT]) {
      log.info(`Missed parents cache ${this}`);
      this._cache.relations[RelationType.PARENT] = await Relation.getAll(this, RelationType.PARENT);
    }
    log.debug(`Hit parents cache ${this._cache.relations[RelationType.PARENT]}`);
    return this._cache.relations[RelationType.PARENT];
  }

  /**
   * Get all children of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The children of this person.
   */
  public async getChildren (): Promise<Relation[]> {
    if (!this._cache.relations[RelationType.CHILD]) {
      log.info(`Missed children cache ${this}`);
      this._cache.relations[RelationType.CHILD] = await Relation.getAll(this, RelationType.CHILD);
    }
    log.debug(`Hit children cache ${this._cache.relations[RelationType.CHILD]}`);
    return this._cache.relations[RelationType.CHILD];
  }

  /**
   * Get all romantic relationships of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The romantic relationships of this person.
   */
  public async getRomantic (): Promise<Relation[]> {
    if (!this._cache.relations[RelationType.ROMANTIC]) {
      log.info(`Missed romantic cache ${this}`);
      this._cache.relations[RelationType.ROMANTIC] = await Relation.getAll(this, RelationType.ROMANTIC);
    }
    log.debug(`Hit romantic cache ${this._cache.relations[RelationType.ROMANTIC]}`);
    return this._cache.relations[RelationType.ROMANTIC];
  }

  /**
   * Get all friends of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The friends of this person.
   */
  public async getFriends (): Promise<Relation[]> {
    if (!this._cache.relations[RelationType.FRIEND]) {
      log.info(`Missed friends cache ${this}`);
      this._cache.relations[RelationType.FRIEND] = await Relation.getAll(this, RelationType.FRIEND);
    }
    log.debug(`Hit friends cache ${this._cache.relations[RelationType.FRIEND]}`);
    return this._cache.relations[RelationType.FRIEND];
  }

  /**
   * Add a relation to this person.
   * @param {string[]} sources The sources of the relation.
   * @param {RelationType} type The type of the relation.
   * @param {Person} relative The relative of the relation.
   * @param {Date} since The since date of the relation.
   * @param {Date} until The until date of the relation.
   * @returns {Promise<Relation|null>} A promise that resolves with the created relation, or null if it already exists.
   */
  public async addRelation (sources: string[], type: RelationType, relative: Person, since?: Date, until?: Date): Promise<Relation|null> {
    const Relation = (await import('./Relation')).default;
    const relation = await Relation.create(type, this, relative, since, until);
    if (!relation) return null;
    this._cache.relations[type] = [...this._cache.relations[type]||[], relation];
    switch (type) {
      case RelationType.PARENT:
        if (relative._cache.relations[RelationType.CHILD]) {
          relative._cache.relations[RelationType.CHILD] = [
            ...relative._cache.relations[RelationType.CHILD],
            relation,
          ];
        }
        break;
      case RelationType.CHILD:
        if (relative._cache.relations[RelationType.PARENT]) {
          relative._cache.relations[RelationType.PARENT] = [
            ...relative._cache.relations[RelationType.PARENT],
            relation,
          ];
        }
        break;
      case RelationType.ROMANTIC:
      case RelationType.FRIEND:
        if (relative._cache.relations[type]) {
          relative._cache.relations[type] = [
            ...relative._cache.relations[type]!,
            relation,
          ];
        }
        break;
    }
    return relation;
  }

  /**
   * Update a relation of this person.
   * @param {Relation} relation The relation to update.
   * @returns {Promise<void>} A promise that resolves when the relation is updated.
   */
  public async updateRelation (relation: Relation): Promise<void> {
    if (relation.from !== this) 
      return relation.to.updateRelation(relation);
    await relation.update();
    this._cache.relations[relation.type] = [
      ...this._cache.relations[relation.type]!.filter(r => r.id !== relation.id),
      relation,
    ];
    switch (relation.type) {
      case RelationType.PARENT:
        if (relation.to._cache.relations[RelationType.CHILD]) {
          relation.to._cache.relations[RelationType.CHILD] = [
            ...relation.to._cache.relations[RelationType.CHILD]!.filter(r => r.id !== relation.id),
            relation,
          ];
        }
        break;
      case RelationType.CHILD:
        if (relation.to._cache.relations[RelationType.PARENT]) {
          relation.to._cache.relations[RelationType.PARENT] = [
            ...relation.to._cache.relations[RelationType.PARENT]!.filter(r => r.id !== relation.id),
            relation,
          ];
        }
        break;
      case RelationType.ROMANTIC:
      case RelationType.FRIEND:
        if (relation.to._cache.relations[relation.type]) {
          relation.to._cache.relations[relation.type] = [
            ...relation.to._cache.relations[relation.type]!.filter(r => r.id !== relation.id),
            relation,
          ];
        }
        break;
    }
  }

  /**
   * Remove a relation from this person.
   * @param {Relation} relation The relation to remove.
   * @returns {Promise<void>} A promise that resolves when the relation is removed.
   */
  public async removeRelation (relation: Relation): Promise<void> {
    if (relation.from !== this) 
      return relation.to.removeRelation(relation);
    await relation.remove();
    this._cache.relations[relation.type] = this._cache.relations[relation.type]!.filter(r => r.id !== relation.id);
    switch (relation.type) {
      case RelationType.PARENT:
        if (relation.to._cache.relations[RelationType.CHILD]) {
          relation.to._cache.relations[RelationType.CHILD] = relation.to._cache.relations[RelationType.CHILD]!.filter(r => r.id !== relation.id);
        }
        break;
      case RelationType.CHILD:
        if (relation.to._cache.relations[RelationType.PARENT]) {
          relation.to._cache.relations[RelationType.PARENT] = relation.to._cache.relations[RelationType.PARENT]!.filter(r => r.id !== relation.id);
        }
        break;
      case RelationType.ROMANTIC:
      case RelationType.FRIEND:
        if (relation.to._cache.relations[relation.type]) {
          relation.to._cache.relations[relation.type] = relation.to._cache.relations[relation.type]!.filter(r => r.id !== relation.id);
        }
        break;
    }
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
    if (typeof v === 'string' && typeof v2 === 'string') {
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
    id = +id;
    const organ = await super.get(id);
    if (!organ) return null;
    if (!PERSON_CACHE.has(id)) {
      log.info(`Missed person cache for ${id}`);
      const client = await pool.connect();
      const res = await client.query(
        'SELECT * FROM person WHERE pid = $1',
        [id],
      );
      client.release();
      if (res.rows.length === 0) {
        PERSON_CACHE.set(id, null);
      } else {
        return new Person(
          organ.id,
          organ.bio,
          res.rows[0].firstname,
          res.rows[0].lastname,
          res.rows[0].birthdate,
          res.rows[0].deathdate,
        );
      }
    }
    log.debug(`Hit person cache ${PERSON_CACHE.get(id)}`);
    return PERSON_CACHE.get(id)!;
  }

  /**
   * Get a random person.
   * @returns {Promise<Person|null>} A promise that resolves with a random person, or null if not found.
   */
  public static async random (): Promise<Person|null> {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT pid FROM person ORDER BY RANDOM() LIMIT 1',
    );
    client.release();
    return res.rows.length === 0 ? null : await Person.get(res.rows[0].pid);
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
