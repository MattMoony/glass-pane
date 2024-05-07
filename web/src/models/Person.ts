import { API } from '@/api';
import * as person from '@/api/person';

import Organ from './Organ';
import Relation from './Relation';
import RelationType from './RelationTypes';

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
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  public children: {
    get: () => Promise<Relation[]>;
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  public romantic: {
    get: () => Promise<Relation[]>;
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  public friends: {
    get: () => Promise<Relation[]>;
    add: (other: Person, since: Date) => Promise<Relation|null>;
  };

  public relations: {
    get: () => Promise<Relation[]>;
    add: (rel: Relation) => Promise<Relation|null>;
    update: (rel: Relation) => Promise<void>;
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

  public get age (): number {
    if (!this.birthdate) return -1;
    const deathdate = this.deathdate || new Date();
    const diff = deathdate.getUTCFullYear() - this.birthdate.getUTCFullYear();
    return this.birthdate.getUTCMonth() > deathdate.getUTCMonth() ? diff - 1 : diff;
  }

  public json (): person.Person {
    return {
      ...super.json(),
      firstname: this.firstname,
      lastname: this.lastname,
      birthdate: this.birthdate,
      deathdate: this.deathdate,
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
