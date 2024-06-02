import * as nation from '@/api/nation';
import Organization from '@/models/Organization';
import Location from '@/models/Location';

class Nation extends Organization implements nation.Nation {
  /**
   * The geographic area of the nation.
   */
  public geo?: GeoJSON.Polygon;

  public constructor (id: number, bio: string, name: string, established?: Date, dissolved?: Date, location?: Location, geo?: GeoJSON.Polygon) {
    super(id, bio, name, established, dissolved, location);
    this.geo = geo;
  }

  /**
   * Converts the nation to a JSON object.
   * @returns The JSON object representing the nation.
   */
  public json (): nation.Nation {
    return {
      ...super.json(),
      geo: this.geo,
    };
  }

  /**
   * Converts the nation to a string.
   * @returns The string representing the nation.
   */
  public toString (): string {
    return `"${this.name}" (Nation#${this.id})`;
  }

  /**
   * Updates the nation.
   * @returns A promise that resolves when the nation has been updated.
   */
  public async update (): Promise<void> {
    await nation.update(this.id, this.name, this.bio, this.established, this.dissolved, this.location?.id, this.geo);
  }

  /**
   * Gets a nation by its ID.
   * @param id The ID of the nation to get.
   * @returns A promise that resolves to the nation with the given ID, or null if no such nation exists.
   */
  public static async get (id: number): Promise<Nation|null> {
    const res = await nation.get(id);
    if (!res.nation) return null;

    return new Nation(
      res.nation.id,
      res.nation.bio,
      res.nation.name,
      res.nation.established,
      res.nation.dissolved,
      res.nation.location ? new Location(
        res.nation.location.id, 
        res.nation.location.name, 
        res.nation.location.coords
      ) : undefined,
      res.nation.geo,
    );
  }

  /**
   * Creates a new nation.
   * @param name The name of the nation.
   * @param bio The bio of the nation.
   * @param established The date the nation was established.
   * @param location The location of the nation.
   * @param geo The geographic area of the nation.
   * @returns A promise that resolves to the new nation.
   */
  public static async create (name: string, bio: string, established?: Date, dissolved?: Date, location?: Location, geo?: GeoJSON.Polygon): Promise<Nation|null> {
    const res = await nation.create(name, bio, established, undefined, location?.id, geo);
    return res.nation ? new Nation(
      res.nation.id,
      res.nation.bio,
      res.nation.name,
      res.nation.established,
      res.nation.dissolved,
      location,
      res.nation.geo,
    ) : null;
  }

  /**
   * Searches for nations by name.
   * @param q The query string to search for.
   * @returns A promise that resolves to the nations that match the query.
   */
  public static async search (q: string): Promise<Nation[]> {
    const res = await nation.search(q);
    return res.nations.map(nation => new Nation(
      nation.id,
      nation.bio,
      nation.name,
      nation.established,
      nation.dissolved,
      nation.location ? new Location(
        nation.location.id, 
        nation.location.name, 
        nation.location.coords
      ) : undefined,
      nation.geo,
    ));
  }
}

export default Nation;
