import Organ from './organ';

/**
 * Represents an organization - i.e. a grouping of several
 * natural or non-natural people. Could be anything from a business
 * to a nation.
 */
class Organization extends Organ {
  public name: string;
  public established?: Date;
  public dissolved?: Date;

  public constructor (id: number, name: string, established?: Date, dissolved?: Date) {
    super(id);
    this.name = name;
    this.established = established;
    this.dissolved = dissolved;
  }

  public json = (): Object => ({
    ...super.json(),
    name: this.name,
    established: this.established?.toISOString(),
    dissolved: this.dissolved?.toISOString(),
  });

  public toString = (): string => {
    return `"${this.name}" (Organization#${this.id})`;
  };
}

export default Organization;
