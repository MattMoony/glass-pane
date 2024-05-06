import * as organ from '../api/organ';

/**
 * Represents a member of an organization. That member
 * doesn't have to be a natural person - they could themselves
 * be an organization, for example.
 */
class Organ implements organ.Organ {
  public id: number;
  public bio: string;

  public sources: {
    get: () => Promise<organ.OrganSource[]>;
    add: (url: string) => Promise<organ.OrganSource|null>;
    update: (sid: number, url: string) => Promise<void>;
    remove: (sid: number) => Promise<void>;
  }

  public constructor (id: number, bio: string) {
    this.id = id;
    this.bio = bio;

    this.sources = {
      get: async () => {
        const res = await organ.sources(this.id);
        return res.sources ? res.sources : [];
      },
      add: async (url: string) => {
        const res = await organ.sources.add(this.id, url);
        return res.id ? { sid: res.id, url } : null;
      },
      update: async (sid: number, url: string) => {
        await organ.sources.update(this.id, sid, url);
      },
      remove: async (sid: number) => {
        await organ.sources.remove(this.id, sid);
      },
    };
  }

  public json (): Object {
    return {
      id: this.id,
      bio: this.bio,
    };
  }

  public toString (): string {
    return `Organ#${this.id}`;
  }

  public static async get (id: number): Promise<Organ|null> {
    const res = await organ.get(id);
    return res.organ ? new Organ(res.organ.id, res.organ.bio) : null;
  }

  public static async create (bio: string): Promise<number|null> {
    const res = await organ.create(bio);
    return res.id ? res.id : null;
  }
}

export default Organ;
