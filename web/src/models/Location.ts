import * as location from '@/api/location';

class Location implements location.Location {
  /**
   * The ID of the location.
   */
  public id: number;
  /**
   * The name of the location.
   */
  public name: string;
  /**
   * The geographic coordinates of the location.
   */
  public coords: GeoJSON.Point;

  public constructor (id: number, name: string, coords: GeoJSON.Point) {
    this.id = id;
    this.name = name;
    this.coords = coords;
  }

  /**
   * Converts the location to a JSON object.
   * @returns The JSON object representing the location.
   */
  public json (): location.Location {
    return {
      id: this.id,
      name: this.name,
      coords: this.coords,
    };
  }

  /**
   * Converts the location to a string.
   * @returns The string representing the location.
   */
  public toString (): string {
    return `"${this.name}" (Location#${this.id})`;
  }

  /**
   * Updates the location.
   * @returns A promise that resolves when the location has been updated.
   */
  public async update (): Promise<void> {
    await location.update(this.id, this.name, this.coords);
  }

  /**
   * Gets a location by its ID.
   * @param id The ID of the location to get.
   * @returns A promise that resolves to the location with the given ID, or null if no such location exists.
   */
  public static async get (id: number): Promise<Location|null> {
    const res = await location.get(id);
    if (!res.location) return null;

    return new Location(
      res.location.id,
      res.location.name,
      res.location.coords,
    );
  }

  /**
   * Creates a new location.
   * @param name The name of the location.
   * @param coords The geographic coordinates of the location.
   * @returns A promise that resolves to the new location.
   */
  public static async create (name: string, coords: GeoJSON.Point): Promise<Location|null> {
    const res = await location.create(name, coords);
    return res.location ? new Location(
      res.location.id, 
      res.location.name, 
      res.location.coords
    ) : null;
  }

  /**
   * Searches for locations by name.
   * @param name The name of the location.
   * @returns A promise that resolves to the locations that match the name.
   */
  public static async search (name: string): Promise<Location[]> {
    const res = await location.search(name);
    return res.locations.map(loc => new Location(
      loc.id,
      loc.name,
      loc.coords
    ));
  }
}

export default Location;
