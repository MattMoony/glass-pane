import Organ from './organ';
import { pool } from '../db';

/**
 * Represents a natural person.
 */
class Person extends Organ {
  public firstname: string;
  public lastname: string;
  public birthdate?: Date;
  public deathdate?: Date;

  public constructor (id: number, firstname: string, lastname: string, birthdate?: Date, deathdate?: Date) {
    super(id);
    this.firstname = firstname;
    this.lastname = lastname;
    this.birthdate = birthdate;
    this.deathdate = deathdate;
  }
  
  public json = (): Object => ({
    ...super.json(),
    firstname: this.firstname,
    lastname: this.lastname,
    birthdate: this.birthdate?.toISOString(),
    deathdate: this.deathdate?.toISOString(),
  });

  public toString = (): string => {
    return `"${this.firstname} ${this.lastname}" (Person#${this.id})`;
  };
}

export default Person;
