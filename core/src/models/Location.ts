/**
 * Represents a physical location.
 */
class Location {
  public id: number;
  public name: string;
  public coords?: [number, number];

  public constructor (id: number, name: string, coords?: [number, number]) {
    this.id = id;
    this.name = name;
    this.coords = coords;
  }

  public json (): Object {
    return {
      id: this.id,
      name: this.name,
      lat: this.coords?.at(0),
      lng: this.coords?.at(1),
    };
  }

  public toString (): string {
    return `"${this.name}" (Location#${this.id})`;
  }
}

export default Location;
