import { API } from '@/api';
import * as person from '@/api/person';
import Organ from './Organ';
import RelationType from './RelationTypes';

/**
 * Represents the relation with another person.
 */
export class Relation {
  public type: RelationType;
  public other: Person;
  public since: Date;
  public until?: Date;

  public constructor (type: RelationType, other: Person, since: Date, until?: Date) {
    this.type = type;
    this.other = other;
    this.since = since;
    this.until = until;
  }
}

/**
 * Represents a natural person.
 */
class Person extends Organ implements person.Person {
  public firstname: string;
  public lastname: string;
  public birthdate?: Date;
  public deathdate?: Date;

  public pic: {
    get: () => Promise<Blob>;
    src: () => string;
    set: (pic: Blob) => Promise<void>;
    remove: () => Promise<void>;
  };

  public parents: {
    get: () => Promise<Relation[]>;
  };

  public children: {
    get: () => Promise<Relation[]>;
  };

  public romantic: {
    get: () => Promise<Relation[]>;
  };

  public friends: {
    get: () => Promise<Relation[]>;
  };

  public relations: {
    get: () => Promise<Relation[]>;
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

    this.pic = {
      get: async () => {
        return await person.pic(this.id);
      },
      src: () => `${API}/person/${this.id}/pic`,
      set: async (pic: Blob) => {
        await person.pic.set(this.id, pic);
      },
      remove: async () => {
        await person.pic.remove(this.id);
      },
    };

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
    };

    this.relations = {
      get: async () => [ 
        ...await this.parents.get(), 
        ...await this.children.get(), 
        ...await this.romantic.get(), 
        ...await this.friends.get()
      ],
    };
  }

  public get age (): number {
    if (!this.birthdate) return -1;
    const deathdate = this.deathdate || new Date();
    const diff = deathdate.getUTCFullYear() - this.birthdate.getUTCFullYear();
    return this.birthdate.getUTCMonth() > deathdate.getUTCMonth() ? diff - 1 : diff;
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
}

export default Person;
