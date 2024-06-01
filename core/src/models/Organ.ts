import { pool } from '../db';
import fs from 'fs';
import fsPromises from 'fs/promises';

import OrganSource from './OrganSource';
import SocialsPlatforms from './SocialsPlatforms';
import Socials from './Socials';
import log from '../log/organ';
import type Membership from './Membership';
import type Organization from './Organization';
import type Role from './Role';

import ORGAN_CACHE from '../cache/organ';


/**
 * Primitive cache object.
 */
interface Cache {
  [key: string]: any;
}

/**
 * Cache of an organ.
 */
export interface OrganCache extends Cache {
  memberships?: Membership[];
  sources?: OrganSource[];
  socials?: Socials[];
}

/**
 * Represents a member of an organ. That member
 * doesn't have to be a natural person - they could themselves
 * be an organ, for example.
 */
class Organ {
  public id: number;
  public bio: string;

  protected _cache: OrganCache = {};

  public constructor (id: number, bio: string) {
    this.id = +id;
    this.bio = bio;
    this.cache();
  }

  protected cache (key?: string, value?: any): void {
    if (key !== undefined && value !== undefined) {
      this._cache[key] = value;
      return;
    }
    const cached = ORGAN_CACHE.get(this.id);
    if (cached === undefined || !(cached instanceof Organ) || cached.bio !== this.bio) {
      log.debug(`Caching organ ${this}`);
      ORGAN_CACHE.set(this.id, this);
    }
  }

  protected async cached (key: string, fallback?: () => Promise<any>): Promise<any> {
    if (this._cache[key] === undefined) {
      log.info(`Missed ${key} cache ${this}`);
      if (fallback)
        this._cache[key] = await fallback();
    }
    log.debug(`Hit ${key} cache ${this}`);
    return this._cache[key];
  }

  /**
   * Returns a JSON representation of the organ.
   * @returns The JSON representation of the organ.
   */
  public json (): Object {
    return {
      id: this.id,
      bio: this.bio,
    };
  }

  /**
   * Returns a string representation of the organ.
   * @returns The string representation of the organ.
   */
  public toString (): string {
    return `Organ#${this.id}`;
  }

  /**
   * Adds a source to the organ.
   * @param source The source to add.
   * @returns A promise that resolves with the added source.
   */
  public async add (source: string): Promise<OrganSource>;
  /**
   * Adds a social media account to the organ.
   * @param platform The platform of the account.
   * @param url The URL of the account.
   * @returns A promise that resolves with the added source.
   */
  public async add (platform: SocialsPlatforms, url: string): Promise<Socials>;
  /**
   * Adds a membership to the organ.
   * @param role The role of the membership.
   * @param organization The organization of the membership.
   * @param sources The sources of the membership.
   * @param since The since date of the membership.
   * @param until The until date of the membership.
   * @returns A promise that resolves with the added membership.
   */
  public async add (role: Role, organization: Organization, sources: string[], since?: Date|null, until?: Date|null): Promise<Membership>;
  public async add (v: string|SocialsPlatforms|Role, v2?: string|Organization, v3?: string[], v4?: Date|null, v5?: Date|null): Promise<OrganSource|Socials|Membership> {
    // lazy import to prevent circular dependencies
    const Role = (await import('./Role')).default;
    const Organization = (await import('./Organization')).default;
    if (typeof v === 'string') {
      const source = await OrganSource.create(this, v);
      const sources = await this.cached('sources') as OrganSource[]|undefined;
      if (sources) sources.push(source);
      return source;
    }
    else if (typeof v === 'number') {
      const social = await Socials.create(this, v, v2 as string);
      const socials = await this.cached('socials') as Socials[]|undefined;
      if (socials) socials.push(social);
      return social;
    } else if (v instanceof Role && v2 instanceof Organization) {
      const Membership = (await import('./Membership')).default;
      const membership = await Membership.create(v3 as string[], this, v2, v, v4, v5);
      const memberships = await this.cached('memberships') as Membership[]|undefined;
      if (memberships) memberships.push(membership);
      return membership;
    }
    throw new Error('Invalid addition type');
  }

  /**
   * Updates the organ in the database.
   * @returns A promise that resolves when the organ has been updated.
   */
  public async update (): Promise<void>;
  /**
   * Updates a source for the organ.
   * @param source The source to update.
   * @returns A promise that resolves when the source has been updated.
   */
  public async update (source: OrganSource): Promise<void>;
  /**
   * Updates a social media account for the organ.
   * @param socials The social media account to update.
   * @returns A promise that resolves when the social media accounts have been updated.
   */
  public async update (socials: Socials): Promise<void>;
  /**
   * Updates a membership of the organ.
   * @param membership The membership to update.
   * @returns A promise that resolves when the membership has been updated.
   */
  public async update (membership: Membership): Promise<void>;
  public async update (v?: OrganSource|Socials|Membership): Promise<void> {
    const Membership = (await import('./Membership')).default;
    if (v instanceof OrganSource) {
      const sources = await this.cached('sources') as OrganSource[]|undefined;
      if (sources) this.cache('sources', (sources as OrganSource[]).map(s => s.id === v.id ? v : s));
      return v.update();
    }
    else if (v instanceof Socials) {
      const socials = await this.cached('socials') as Socials[]|undefined;
      if (socials) this.cache('socials', (socials as Socials[]).map(s => s.id === v.id ? v : s));
      return v.update();
    } 
    else if (v instanceof Membership) {
      const memberships = await this.cached('memberships') as Membership[]|undefined;
      if (memberships) this.cache('memberships', this._cache.memberships = (memberships as Membership[]).map(m => m.id === v.id ? v : m));
      return v.update();
    }
    return fsPromises.writeFile(`${process.env.DATA_DIR}/${this.id}.md`, this.bio);
  }

  /**
   * Removes the organ from the database.
   * @returns A promise that resolves when the organ has been removed.
   */
  public async remove (): Promise<void>;
  /**
   * Removes a source from the organ.
   * @param source The source to remove.
   * @returns A promise that resolves when the source has been removed.
   */
  public async remove (source: OrganSource): Promise<void>;
  /**
   * Removes a social media account from the organ.
   * @param socials The social media account to remove.
   * @returns A promise that resolves when the social media account has been removed.
   */
  public async remove (socials: Socials): Promise<void>;
  /**
   * Removes a membership from the organ.
   * @param membership The membership to remove.
   * @returns A promise that resolves when the membership has been removed.
   */
  public async remove (membership: Membership): Promise<void>;
  public async remove (v?: OrganSource|Socials|Membership): Promise<void> {
    const Membership = (await import('./Membership')).default;
    if (v instanceof OrganSource) {
      const sources = await this.cached('sources') as OrganSource[]|undefined;
      if (sources) this.cache('sources', sources.filter(s => s.id !== v.id));
      return v.remove();
    }
    else if (v instanceof Socials) {
      const socials = await this.cached('socials') as Socials[]|undefined;
      if (socials) this.cache('socials', socials.filter(s => s.id !== v.id));
      return v.remove();
    }
    else if (v instanceof Membership) {
      const memberships = await this.cached('memberships') as Membership[]|undefined;
      if (memberships) this.cache('memberships', memberships.filter(m => m.id !== v.id));
      return v.remove();
    }
    const client = await pool.connect();
    await client.query('DELETE FROM organ WHERE oid = $1', [this.id]);
    client.release();
    log.debug(`Nulling organ cache ${this}`);
    ORGAN_CACHE.delete(this.id);
  }

  /**
   * Returns all sources for the organ.
   * @returns A promise that resolves with all sources for the organ.
   */
  public async sources (): Promise<OrganSource[]> {
    return this.cached('sources', async () => {
      const client = await pool.connect();
      const res = await client.query('SELECT sid, url FROM organ_source WHERE organ = $1', [this.id]);
      client.release();
      return res.rows.map(row => new OrganSource(+row.sid, row.url));
    });
  }

  /**
   * Returns all social media accounts for the organ.
   * @returns A promise that resolves with all social media accounts for the organ.
   */
  public async socials (): Promise<Socials[]> {
    return this.cached('socials', async () => {
      const client = await pool.connect();
      const res = await client.query('SELECT sid, platform, url FROM socials WHERE organ = $1', [this.id]);
      client.release();
      return res.rows.map(row => new Socials(+row.sid, +row.platform, row.url));
    });
  }

  /**
   * Returns all memberships for the organ.
   * @returns A promise that resolves with all memberships for the organ.
   */
  public async memberships (): Promise<Membership[]> {
    return this.cached('memberships', async () => {
      const Membership = (await import('./Membership')).default;
      // force cast to Organ because of organizations
      return Membership.get(new Organ(this.id, this.bio));
    });
  }

  /**
   * Creates a new organ.
   * @returns A promise that resolves with the created organ.
   */
  public static async create (): Promise<Organ>;
  /**
   * Creates a new organ with a bio.
   * @param bio The bio of the organ.
   * @returns A promise that resolves with the created organ.
   */
  public static async create (bio: string): Promise<Organ>;
  public static async create (v?: string): Promise<Organ> {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO organ DEFAULT VALUES RETURNING oid');
    client.release();
    const oid = +result.rows[0].oid;
    fs.writeFileSync(`${process.env.DATA_DIR}/${oid}.md`, v||'');
    return new Organ(oid, v||'');
  }

  /**
   * Finds an organ by its ID.
   * @param id The ID of the organ to find.
   * @returns A promise that resolves with the found organ, or null if it doesn't exist.
   */
  public static async get (id: number): Promise<Organ|null> {
    const _id = +id;
    if (isNaN(_id)) return null;
    if (!ORGAN_CACHE.has(_id)) {
      log.info(`Missed organ cache ${_id}`);
      const client = await pool.connect();
      const res = await client.query('SELECT * FROM organ WHERE oid = $1', [_id]);
      client.release();
      if (res.rows.length === 0) {
      } else {
        if (!fs.existsSync(`${process.env.DATA_DIR}/${_id}.md`)) fs.writeFileSync(`${process.env.DATA_DIR}/${_id}.md`, '');
        return new Organ(+res.rows[0].oid, fs.readFileSync(`${process.env.DATA_DIR}/${_id}.md`, 'utf8'));
      }
    }
    log.debug(`Hit organ cache ${_id}`);
    return ORGAN_CACHE.get(_id)||null;
  }
}

export default Organ;
