import { pool } from '../db';

import Organ, { OrganCache } from './Organ';
import OrganSource from './OrganSource';
import RelationType from './RelationshipType';
import Relation from './Relation';
import RelationSource from './RelationSource';
import Socials from './Socials';
import SocialsPlatforms from './SocialsPlatforms';
import log from '../log/person';
import type Role from './Role';
import type Organization from './Organization';
import type Membership from './Membership';
import Location from './Location';
import Nation from './Nation';

import ORGAN_CACHE from '../cache/organ';


/**
 * Cache of a person.
 */
export interface PersonCache extends OrganCache {
  relations?: Relation[];
}

/**
 * Represents a natural person.
 */
class Person extends Organ {
  public firstname: string;
  public lastname: string;
  public birthdate?: Date|null;
  public deathdate?: Date|null;
  public birthlocation?: Location|null;
  public birthnation?: Nation|null;
  public deathlocation?: Location|null;
  public deathnation?: Nation|null;

  protected _cache: PersonCache = {};

  public constructor (
    id: number, 
    bio: string, 
    firstname: string, 
    lastname: string, 
    birthdate?: Date|null, 
    deathdate?: Date|null,
    birthlocation?: Location|null,
    birthnation?: Nation|null,
    deathlocation?: Location|null,
    deathnation?: Nation|null,
  ) {
    super(id, bio);
    this.firstname = firstname;
    this.lastname = lastname;
    this.birthdate = birthdate;
    this.deathdate = deathdate;
    this.birthlocation = birthlocation;
    this.birthnation = birthnation;
    this.deathlocation = deathlocation;
    this.deathnation = deathnation;
    this.cache();
  }
  
  protected cache (key?: string, value?: any): void {
    if (key && value) return super.cache(key, value);
    const cached = ORGAN_CACHE.get(this.id);
    if (cached === undefined 
        || !(cached instanceof Person) 
        || cached.bio !== this.bio 
        || cached.firstname !== this.firstname 
        || cached.lastname !== this.lastname 
        || cached.birthdate !== this.birthdate 
        || cached.deathdate !== this.deathdate
    ) {
      log.debug(`Caching person ${this}`);
      ORGAN_CACHE.set(this.id, this);
    }
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
      birthlocation: this.birthlocation?.json(),
      birthnation: this.birthnation?.json(),
      deathlocation: this.deathlocation?.json(),
      deathnation: this.deathnation?.json(),
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
   * Adds a membership to the organ.
   * @param role The role of the membership.
   * @param organization The organization of the membership.
   * @param sources The sources of the membership.
   * @param since The since date of the membership.
   * @param until The until date of the membership.
   * @returns A promise that resolves with the added membership.
   */
  public async add (role: Role, organization: Organization, sources: string[], since?: Date|null, until?: Date|null): Promise<Membership>;
  /**
   * Add a relation to this person.
   * @param other The other person in the relation.
   * @param relation The type of the relation.
   * @param sources The sources of the relation.
   * @param since The since date of the relation.
   * @param until The until date of the relation.
   * @returns A promise that resolves with the added relation.
   */
  public async add (other: Person, relation: RelationType, sources: string[], since?: Date, until?: Date): Promise<Relation|null>;
  public async add (v: string|SocialsPlatforms|Role|Person, v2?: string|Organization|RelationType, v3?: string[], v4?: Date|null, v5?: Date|null): Promise<OrganSource|Socials|Membership|Relation|null> {
    const Role = (await import('./Role')).default;
    if (typeof v === 'string') return super.add(v);
    else if (typeof v === 'number' && typeof v2 === 'string') return super.add(v, v2);
    else if (v instanceof Role) return super.add(v as Role, v2 as Organization, v3 as string[], v4, v5);
    else if (v instanceof Person) {
      const relation = await Relation.create(v2 as RelationType, this, v, v4, v5);
      const relations = await this.cached('relations') as Relation[];
      if (relations && relation) relations.push(relation);
      return relation;
    }
    throw new Error('Invalid argument types');
  }

  /**
   * Update this person in the database.
   * @returns {Promise<void>} A promise that resolves when the person is updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a source for the organ.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (source: OrganSource): Promise<void>;
  /**
   * Updates a social media account for the organ.
   * @param socials The social media account to update.
   * @returns A promise that resolves when the social media accounts have been updated.
   */
  public async update (socials: Socials): Promise<void>;
  /**
   * Updates a membership of the organ.
   * @param membership The membership to update.
   * @returns A promise that resolves when the membership has been updated.
   */
  public async update (membership: Membership): Promise<void>;
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
  public async update (v?: Relation|OrganSource|Socials|Membership, v2?: RelationSource): Promise<void> {
    const Membership = (await import('./Membership')).default;
    if (v instanceof Relation && v2 instanceof RelationSource) return v.update(v2);
    else if (v instanceof OrganSource) return super.update(v);
    else if (v instanceof Socials) return super.update(v);
    else if (v instanceof Membership) return super.update(v);
    else if (v instanceof Relation) {
      const relations = await this.cached('relations') as Relation[];
      if (relations) this.cache('relations', (relations as Relation[]).map(r => r.id === v.id ? v : r));
      return v.update();
    }
    await super.update();
    const client = await pool.connect();
    await client.query(
      `UPDATE     person
       SET         firstname = $1,
                   lastname = $2,
                   birthdate = $3,
                   deathdate = $4,
                   birthplace = $5,
                   birthnation = $6,
                   deathplace = $7,
                   deathnation = $8
       WHERE       pid = $9`,
       [
        this.firstname,
        this.lastname,
        this.birthdate,
        this.deathdate,
        this.birthlocation?.id,
        this.birthnation?.id,
        this.deathlocation?.id,
        this.deathnation?.id,
        this.id,
       ]
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
   * Removes a social media account from the organ.
   * @param socials The social media account to remove.
   * @returns A promise that resolves when the social media account has been removed.
   */
  public async remove (socials: Socials): Promise<void>;
  /**
   * Removes a membership from the organ.
   * @param membership The membership to remove.
   * @returns A promise that resolves when the membership has been removed.
   */
  public async remove (membership: Membership): Promise<void>;
  /**
   * Remove a relation from this person.
   * @param {Relation} relation The relation to remove.
   * @returns {Promise<void>} A promise that resolves when the relation is removed.
   */
  public async remove (relation: Relation): Promise<void>;
  public async remove (v?: Relation|OrganSource|Socials|Membership): Promise<void> {
    const Membership = (await import('./Membership')).default;
    if (v instanceof OrganSource) return super.remove(v);
    else if (v instanceof Socials) return super.remove(v);
    else if (v instanceof Membership) return super.remove(v);
    else if (v instanceof Relation) {
      const relations = await this.cached('relations') as Relation[];
      if (relations) this.cache('relations', (relations as Relation[]).filter(r => r.id !== v.id));
      return v.remove();
    }
    const client = await pool.connect();
    await client.query(
      'DELETE FROM person WHERE pid = $1',
      [this.id],
    );
    client.release();
    super.remove();
    log.debug(`Nulling person cache ${this}`);
    ORGAN_CACHE.delete(this.id);
  }

  /**
   * Get all relations of this person.
   * @returns {Promise<Relation[]>} The relations of this person.
   */
  public async relations (): Promise<Relation[]> {
    return this.cached('relations', async () => {
      const parents = await Relation.getAll(this, RelationType.PARENT);
      const children = await Relation.getAll(this, RelationType.CHILD);
      const romantic = await Relation.getAll(this, RelationType.ROMANTIC);
      const friends = await Relation.getAll(this, RelationType.FRIEND);
      return parents.concat(children).concat(romantic).concat(friends);
    });
  }

  /**
   * Get all parents of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The parents of this person.
   */
  public async parents (): Promise<Relation[]> {
    return (await this.relations()).filter(r => r.type === RelationType.PARENT && r.from === this);
  }

  /**
   * Get all children of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The children of this person.
   */
  public async children (): Promise<Relation[]> {
    // TODO: need to finally fucking fix shit
    // TODO: with these special, non-existent relation types :(
    return (await this.relations()).filter(r => r.type === RelationType.PARENT && r.to === this);
  }

  /**
   * Get all romantic relationships of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The romantic relationships of this person.
   */
  public async romantic (): Promise<Relation[]> {
    return (await this.relations()).filter(r => r.type === RelationType.ROMANTIC);
  }

  /**
   * Get all friends of this person.
   * @deprecated Planning on removing this - not really good coding.
   * @returns {Promise<Relation[]>} The friends of this person.
   */
  public async friends (): Promise<Relation[]> {
    return (await this.relations()).filter(r => r.type === RelationType.FRIEND);
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
   * @param {Location} birthlocation The birth location of the person.
   * @param {Nation} birthnation The birth nation of the person.
   * @param {Location} deathlocation The death location of the person.
   * @param {Nation} deathnation The death nation of the person.
   * @returns {Promise<Person>} A promise that resolves with the created person.
   */
  public static async create (
    firstname: string, 
    lastname: string, 
    birthdate?: Date, 
    deathdate?: Date, 
    bio?: string,
    birthlocation?: Location,
    birthnation?: Nation,
    deathlocation?: Location,
    deathnation?: Nation,
  ): Promise<Person>;
  public static async create (
    v?: string, 
    v2?: string, 
    v3?: Date, 
    v4?: Date, 
    v5?: string,
    v6?: Location,
    v7?: Nation,
    v8?: Location,
    v9?: Nation,
  ): Promise<Person|Organ> {
    if (v === undefined) return await super.create();
    if (typeof v === 'string' && v2 === undefined) return await super.create(v);
    if (typeof v === 'string' && typeof v2 === 'string') {
      const organ = v5 ? await super.create(v5) : await super.create();
      const client = await pool.connect();
      await client.query(
        `INSERT INTO person (pid, firstname, lastname, birthdate, deathdate, birthplace, birthnation, deathplace, deathnation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          organ.id,
          v,
          v2,
          v3,
          v4,
          v6?.id,
          v7?.id,
          v8?.id,
          v9?.id,
        ],
      );
      client.release();
      return new Person(organ.id, organ.bio, v, v2, v3, v4, v6, v7, v8, v9);
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
    const cached = ORGAN_CACHE.get(id);
    if (cached === undefined || !(cached instanceof Person)) {
      log.info(`Missed person cache for ${id}`);
      const client = await pool.connect();
      const res = await client.query(
        'SELECT * FROM person WHERE pid = $1',
        [id],
      );
      client.release();
      if (res.rows.length === 0) {
      } else {
        return new Person(
          organ.id,
          organ.bio,
          res.rows[0].firstname,
          res.rows[0].lastname,
          res.rows[0].birthdate,
          res.rows[0].deathdate,
          res.rows[0].birthplace ? await Location.get(res.rows[0].birthplace) : undefined,
          res.rows[0].birthnation ? await Nation.get(res.rows[0].birthnation) : undefined,
          res.rows[0].deathplace ? await Location.get(res.rows[0].deathplace) : undefined,
          res.rows[0].deathnation ? await Nation.get(res.rows[0].deathnation) : undefined,
        );
      }
    }
    log.debug(`Hit person cache ${ORGAN_CACHE.get(id)}`);
    return (ORGAN_CACHE.get(id) as Person)||null;
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
