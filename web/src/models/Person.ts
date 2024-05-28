import { Mutex } from 'async-mutex';

import * as person from '@/api/person';

import Organ, { type OrganCache } from './Organ';
import Relation from './Relation';
import RelationType from './RelationTypes';

export interface PersonCache extends OrganCache {
  /**
     * The parents of the person.
     */
  parents?: Relation[];
  /**
   * The children of the person.
   */
  children?: Relation[];
  /**
   * The romantic partners of the person.
   */
  romantic?: Relation[];
  /**
   * The friends of the person.
   */
  friends?: Relation[];
};

/**
 * Represents a natural person.
 */
class Person extends Organ implements person.Person {
  /**
   * The first name of the person.
   */
  public firstname: string;
  /**
   * The last name of the person.
   */
  public lastname: string;
  /**
   * The birthdate of the person.
   */
  public birthdate?: Date;
  /**
   * The deathdate of the person.
   */
  public deathdate?: Date;

  /**
   * The parents of the person.
   */
  public parents: {
    /**
     * Gets the parents of the person.
     */
    get: (refresh?: boolean) => Promise<Relation[]>;
    /**
     * Adds a parent to the person.
     * @param other The parent to add.
     * @param since The date the parent became a parent of the person.
     * @returns A promise that resolves to the relation between the person and the parent, or null if the relation could not be added.
     */
    add: (other: Person, since: Date, sources: string[]) => Promise<Relation|null>;
  };

  /**
   * Mutex for parents operations.
   */
  private parents_mutex = new Mutex();

  /**
   * The children of the person.
   */
  public children: {
    /**
     * Gets the children of the person.
     */
    get: (refresh?: boolean) => Promise<Relation[]>;
    /**
     * Adds a child to the person.
     * @param other The child to add.
     * @param since The date the person became a parent of the child.
     * @returns A promise that resolves to the relation between the person and the child, or null if the relation could not be added.
     */
    add: (other: Person, since: Date, sources: string[]) => Promise<Relation|null>;
  };

  /**
   * Mutex for children operations.
   */
  private children_mutex = new Mutex();

  /**
   * The romantic partners of the person.
   */
  public romantic: {
    /**
     * Gets the romantic partners of the person.
     */
    get: (refresh?: boolean) => Promise<Relation[]>;
    /**
     * Adds a romantic partner to the person.
     * @param other The romantic partner to add.
     * @param since The date the person became romantically involved with the partner.
     * @returns A promise that resolves to the relation between the person and the partner, or null if the relation could not be added.
     */
    add: (other: Person, since: Date, sources: string[]) => Promise<Relation|null>;
  };

  /**
   * Mutex for romantic operations.
   */
  private romantic_mutex = new Mutex();

  /**
   * The friends of the person.
   */
  public friends: {
    /**
     * Gets the friends of the person.
     * @returns A promise that resolves to the friends of the person.
     */
    get: (refresh?: boolean) => Promise<Relation[]>;
    /**
     * Adds a friend to the person.
     * @param other The friend to add.
     * @param since The date the person became friends with the friend.
     * @returns A promise that resolves to the relation between the person and the friend, or null if the relation could not be added.
     */
    add: (other: Person, since: Date, sources: string[]) => Promise<Relation|null>;
  };

  /**
   * Mutex for friends operations.
   */
  private friends_mutex = new Mutex();

  /**
   * The relations of the person.
   */
  public relations: {
    /**
     * Gets the relations of the person.
     * @returns A promise that resolves to the relations of the person.
     */
    get: (refresh?: boolean) => Promise<Relation[]>;
    /**
     * Adds a relation to the person.
     * @param rel The relation to add.
     * @returns A promise that resolves to the relation between the person and the other person, or null if the relation could not be added.
     */
    add: (rel: Relation, sources: string[]) => Promise<Relation|null>;
    /**
     * Updates a relation of the person.
     * @param rel The relation to update.
     * @returns A promise that resolves when the relation is updated.
     */
    update: (rel: Relation) => Promise<void>;
    /**
     * Removes a relation of the person.
     * @param rel The relation to remove.
     * @returns A promise that resolves when the relation is removed.
     */
    remove: (rel: Relation) => Promise<void>;
    /**
     * The sources of relations.
     */
    sources: {
      /**
       * Gets the sources of a relation.
       * @param rel The relation to get the sources of.
       * @returns A promise that resolves to the sources of the relation.
       */
      get: (rel: Relation) => Promise<person.RelationSource[]>;
    };
  };

  /**
   * Mutex for relations operations.
   */
  private relations_mutex = new Mutex();

  /**
   * Cache for data of the person.
   */
  protected cache: PersonCache = {};

  public constructor (
    id: number, 
    bio: string, 
    firstname: string, 
    lastname: string, 
    birthdate?: Date, 
    deathdate?: Date
  ) {
    super(id, bio);

    this.firstname = firstname;
    this.lastname = lastname;
    this.birthdate = birthdate;
    this.deathdate = deathdate;

    this.parents = {
      get: async (refresh?: boolean) => {
        const release = await this.parents_mutex.acquire();
        if (refresh || !this.cache.parents) {
          const res = await person.parents(this.id);
          this.cache.parents = res.parents?.map(r => new Relation(
            r.id,
            RelationType.PARENT,
            this,
            new Person(
              r.to.id,
              r.to.bio,
              r.to.firstname,
              r.to.lastname,
              r.to.birthdate ? new Date(r.to.birthdate) : undefined,
              r.to.deathdate ? new Date(r.to.deathdate) : undefined,
            ), 
            r.since, 
            r.until
          )) || [];
        }
        release();
        return this.cache.parents;
      },
      add: async (other: Person, since: Date, sources: string[]) => {
        return await this.relations.add(new Relation(
          -1,
          RelationType.PARENT,
          other,
          since
        ), sources);
      },
    };

    this.children = {
      get: async (refresh?: boolean) => {
        const release = await this.children_mutex.acquire();
        if (refresh || !this.cache.children) {
          const res = await person.children(this.id);
          this.cache.children = res.children?.map(r => new Relation(
            r.id,
            RelationType.CHILD,
            this,
            new Person(
              r.to.id,
              r.to.bio,
              r.to.firstname,
              r.to.lastname,
              r.to.birthdate ? new Date(r.to.birthdate) : undefined,
              r.to.deathdate ? new Date(r.to.deathdate) : undefined,
            ), 
            r.since, 
            r.until
          )) || [];
        }
        release();
        return this.cache.children;
      },
      add: async (other: Person, since: Date, sources: string[]) => {
        return await this.relations.add(new Relation(
          -1,
          RelationType.CHILD,
          other,
          since
        ), sources);
      }
    };

    this.romantic = {
      get: async (refresh?: boolean) => {
        const release = await this.romantic_mutex.acquire();
        if (refresh || !this.cache.romantic) {
          const res = await person.romantic(this.id);
          this.cache.romantic = res.romantic?.map(r => new Relation(
            r.id,
            RelationType.ROMANTIC,
            this,
            new Person(
              r.to.id,
              r.to.bio,
              r.to.firstname,
              r.to.lastname,
              r.to.birthdate ? new Date(r.to.birthdate) : undefined,
              r.to.deathdate ? new Date(r.to.deathdate) : undefined,
            ), 
            r.since, 
            r.until
          )) || [];
        }
        release();
        return this.cache.romantic;
      },
      add: async (other: Person, since: Date, sources: string[]) => {
        return await this.relations.add(new Relation(
          -1,
          RelationType.ROMANTIC,
          other,
          since
        ), sources);
      },
    };

    this.friends = {
      get: async (refresh?: boolean) => {
        const release = await this.friends_mutex.acquire();
        if (refresh || !this.cache.friends) {
          const res = await person.friends(this.id);
          this.cache.friends = res.friends?.map(r => new Relation(
            r.id,
            RelationType.FRIEND,
            this,
            new Person(
              r.to.id,
              r.to.bio,
              r.to.firstname,
              r.to.lastname,
              r.to.birthdate ? new Date(r.to.birthdate) : undefined,
              r.to.deathdate ? new Date(r.to.deathdate) : undefined,
            ), 
            r.since, 
            r.until
          )) || [];
        }
        release();
        return this.cache.friends;
      },
      add: async (other: Person, since: Date, sources: string[]) => {
        return await this.relations.add(new Relation(
          -1,
          RelationType.FRIEND,
          other,
          since
        ), sources);
      },
    };

    this.relations = {
      get: async (refresh?: boolean) => [ 
        ...await this.parents.get(refresh), 
        ...await this.children.get(refresh), 
        ...await this.romantic.get(refresh), 
        ...await this.friends.get(refresh)
      ],
      add: async (rel: Relation, sources: string[]) => {
        const _rel = rel.type !== RelationType.CHILD 
                         ? rel
                         : new Relation(
                            rel.id,
                            RelationType.PARENT,
                            this,
                            rel.since,
                            rel.until
                         );
        const res = await person.rel.add(
          _rel.type,
          rel.type !== RelationType.CHILD ? this.id : rel.other.id,
          rel.type !== RelationType.CHILD ? _rel.other.id : this.id,
          sources,
          _rel.since
        );
        if (!res.relation) return null;
        return new Relation(
          res.relation.id,
          _rel.type,
          this,
          _rel.other,
          _rel.since,
          _rel.until
        );
      },
      update: async (rel: Relation) => {
        await person.rel.update(
          this.id, 
          rel.id, 
          rel.since,
          rel.until
        );
      },
      remove: async (rel: Relation) => {
        await person.rel.remove(
          this.id,
          rel.id,
        );
      },
      sources: {
        get: async (rel: Relation) => {
          const res = await person.rel_sources(this.id, rel.id);
          return res.sources ? res.sources : [];
        },
      },
    };
  }

  /**
   * The age of the person.
   * @returns The age of the person, or -1 if the birthdate is not set.
   */
  public get age (): number {
    if (!this.birthdate) return -1;
    const deathdate = this.deathdate || new Date();
    const diff = deathdate.getUTCFullYear() - this.birthdate.getUTCFullYear();
    return this.birthdate.getUTCMonth() > deathdate.getUTCMonth() ? diff - 1 : diff;
  }

  public get fullName (): string {
    return `${this.firstname} ${this.lastname}`;
  }

  /**
   * Converts the person to a JSON object.
   * @returns The JSON object representing the person.
   */
  public json (): person.Person {
    return {
      ...super.json(),
      firstname: this.firstname,
      lastname: this.lastname,
      birthdate: this.birthdate,
      deathdate: this.deathdate,
    };
  }

  /**
   * Converts the person to a string.
   * @returns The string representation of the person.
   */
  public toString (): string {
    return `"${this.firstname} ${this.lastname}" (Person#${this.id})`;
  }

  /**
   * Updates the person.
   * @returns A promise that resolves when the person is updated.
   */
  public async update (): Promise<void> {
    await person.update(this.id, this.firstname, this.lastname, this.bio, this.birthdate, this.deathdate);
  }

  /**
   * Gets a person by their ID.
   * @param id The ID of the person to get.
   * @returns A promise that resolves to the person with the given ID, or null if no such person exists.
   */
  public static async get (id: number): Promise<Person|null> {
    const res = await person.get(id);
    return res.person ? new Person(
      res.person.id,
      res.person.bio,
      res.person.firstname,
      res.person.lastname,
      res.person.birthdate ? new Date(res.person.birthdate) : undefined,
      res.person.deathdate ? new Date(res.person.deathdate) : undefined,
    ) : null;
  }

  /**
   * Creates a new person.
   * @param firstname The first name of the person.
   * @param lastname The last name of the person.
   * @param bio The biography of the person.
   * @param birthdate The birthdate of the person.
   * @param deathdate The deathdate of the person.
   * @returns A promise that resolves to the new person, or null if the person could not be created.
   */
  public static async create (
    firstname: string, 
    lastname: string, 
    bio: string,
    birthdate?: Date,
    deathdate?: Date
  ): Promise<Person|null> {
    const res = await person.create(firstname, lastname, bio, birthdate, deathdate);
    return res.person ? new Person(
      res.person.id, 
      bio, 
      firstname, 
      lastname, 
      birthdate, 
      deathdate
    ) : null;
  }

  /**
   * Searches for people by their name.
   * @param query The name of the person to search for.
   * @returns A promise that resolves to the people that match the query.
   */
  public static async search (query: string): Promise<Person[]> {
    const res = await person.search(query);
    return res.people.map(p => new Person(
      p.id,
      p.bio,
      p.firstname,
      p.lastname,
      p.birthdate ? new Date(p.birthdate) : undefined,
      p.deathdate ? new Date(p.deathdate) : undefined,
    ));
  }

  /**
   * Gets a random person.
   * @returns A promise that resolves to a random person.
   */
  public static async random (): Promise<Person|null> {
    const res = await person.random();
    if (!res.person) return null;
    return new Person(
      res.person.id,
      res.person.bio,
      res.person.firstname,
      res.person.lastname,
      res.person.birthdate ? new Date(res.person.birthdate) : undefined,
      res.person.deathdate ? new Date(res.person.deathdate) : undefined,
    );
  }
}

export default Person;
