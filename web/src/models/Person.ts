import { API } from '@/api';
import * as person from '@/api/person';
import Organ from './Organ';

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
