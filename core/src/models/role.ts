/**
 * Represents a role in an organization.
 */
class Role {
  public id: number;
  public name: string;

  public constructor (id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public json = (): Object => ({
    id: this.id,
    name: this.name,
  });

  public toString = (): string => {
    return `"${this.name}" (Role#${this.id})`;
  };
}

export default Role;