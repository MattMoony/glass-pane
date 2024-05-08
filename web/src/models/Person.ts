import * as person from '@/api/person';

import Organ from './Organ';
import Relation from './Relation';
import RelationType from './RelationTypes';

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
    get: () => Promise<Relation[]>;
    /**
     * Adds a parent to the person.
     * @param other The parent to add.
     * @param since The date the parent became a parent of the person.
     * @returns A promise that resolves to the relation between the person and the parent, or null if the relation could not be added.
     */
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  /**
   * The children of the person.
   */
  public children: {
    /**
     * Gets the children of the person.
     */
    get: () => Promise<Relation[]>;
    /**
     * Adds a child to the person.
     * @param other The child to add.
     * @param since The date the person became a parent of the child.
     * @returns A promise that resolves to the relation between the person and the child, or null if the relation could not be added.
     */
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  /**
   * The romantic partners of the person.
   */
  public romantic: {
    /**
     * Gets the romantic partners of the person.
     */
    get: () => Promise<Relation[]>;
    /**
     * Adds a romantic partner to the person.
     * @param other The romantic partner to add.
     * @param since The date the person became romantically involved with the partner.
     * @returns A promise that resolves to the relation between the person and the partner, or null if the relation could not be added.
     */
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  /**
   * The friends of the person.
   */
  public friends: {
    /**
     * Gets the friends of the person.
     * @returns A promise that resolves to the friends of the person.
     */
    get: () => Promise<Relation[]>;
    /**
     * Adds a friend to the person.
     * @param other The friend to add.
     * @param since The date the person became friends with the friend.
     * @returns A promise that resolves to the relation between the person and the friend, or null if the relation could not be added.
     */
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  /**
   * The relations of the person.
   */
  public relations: {
    /**
     * Gets the relations of the person.
     * @returns A promise that resolves to the relations of the person.
     */
    get: () => Promise<Relation[]>;
    /**
     * Adds a relation to the person.
     * @param rel The relation to add.
     * @returns A promise that resolves to the relation between the person and the other person, or null if the relation could not be added.
     */
    add: (rel: Relation) => Promise<Relation|null>;
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
  };

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
      get: async () => {
        const res = await person.parents(this.id);
        return res.parents?.map(r => new Relation(
          RelationType.PARENT,
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
      },
      add: async (other: Person, since: Date) => {
        return await this.relations.add(new Relation(
          RelationType.PARENT,
          other,
          since
        ));
      },
    };

    this.children = {
      get: async () => {
        const res = await person.children(this.id);
        return res.children?.map(r => new Relation(
          RelationType.CHILD,
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
      },
      add: async (other: Person, since: Date) => {
        return await this.relations.add(new Relation(
          RelationType.CHILD,
          other,
          since
        ));
      }
    };

    this.romantic = {
      get: async () => {
        const res = await person.romantic(this.id);
        return res.romantic?.map(r => new Relation(
          RelationType.ROMANTIC,
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
      },
      add: async (other: Person, since: Date) => {
        return await this.relations.add(new Relation(
          RelationType.ROMANTIC,
          other,
          since
        ));
      },
    };

    this.friends = {
      get: async () => {
        const res = await person.friends(this.id);
        return res.friends?.map(r => new Relation(
          RelationType.FRIEND,
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
      },
      add: async (other: Person, since: Date) => {
        return await this.relations.add(new Relation(
          RelationType.FRIEND,
          other,
          since
        ));
      },
    };

    this.relations = {
      get: async () => [ 
        ...await this.parents.get(), 
        ...await this.children.get(), 
        ...await this.romantic.get(), 
        ...await this.friends.get()
      ],
      add: async (rel: Relation) => {
        const _rel = rel.type !== RelationType.CHILD 
                         ? rel
                         : new Relation(
                            RelationType.PARENT,
                            this,
                            rel.since,
                            rel.until
                         );
        const res = await person.rel.add(
          RelationType[_rel.type].toLowerCase(),
          rel.type !== RelationType.CHILD ? this.id : rel.other.id,
          rel.type !== RelationType.CHILD ? _rel.other.id : this.id,
          _rel.since
        );
        if (!res.success) return null;
        return new Relation(
          _rel.type,
          _rel.other,
          _rel.since,
          _rel.until
        );
      },
      update: async (rel: Relation) => {
        await person.rel.update(
          this.id, 
          rel.other.id, 
          rel.since,
          rel.until
        );
      },
      remove: async (rel: Relation) => {
        await person.rel.remove(
          this.id, 
          rel.other.id,
          rel.since,
        );
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
}

export default Person;
