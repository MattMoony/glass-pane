import { API } from '@/api';
import * as organ from '@/api/organ';
import * as person from '@/api/person';
import * as organization from '@/api/organization';
import { marked } from '@/lib/markdown';
import { reactive, ref, type Ref } from 'vue';
import type SocialsPlatforms from './SocialsPlatform';
import { Mutex } from 'async-mutex';
import type Membership from './Membership';
import Role from './Role';

/**
 * Cache for socials and sources.
 */
export interface OrganCache {
  /**
       * The socials of the organ.
       */
  socials?: organ.OrganSocials[];
  /**
   * The sources of the organ.
   */
  sources?: organ.OrganSource[];
  /**
   * The memberships of the organ.
   */
  memberships?: Membership[];
}

/**
 * Represents a member of an organization. That member
 * doesn't have to be a natural person - they could themselves
 * be an organization, for example.
 */
class Organ implements organ.Organ {
  /**
   * The ID of the organ. This is unique across all organs.
   */
  public id: number;
  /**
   * The bio of the organ. This is a Markdown string.
   */
  public bio: string;
  /**
   * Maybe this helps for reactivity in Vue or something.
   */
  public _vref: Ref<number>;

  /**
   * The picture of the organ. This is a blob, and can be
   * set, removed, and fetched.
   */
  public pic: {
    /**
     * Fetches the picture of the organ.
     * @returns A promise that resolves to the picture of the organ.
     */
    get: () => Promise<Blob>;
    /**
     * Gets the URL of the picture of the organ.
     * @returns The URL of the picture of the organ.
     */
    src: () => string;
    /**
     * Sets the picture of the organ.
     * @param pic The picture to set.
     * @returns A promise that resolves when the picture is set.
     */
    set: (pic: Blob) => Promise<void>;
    /**
     * Removes the picture of the organ.
     * @returns A promise that resolves when the picture is removed.
     */
    remove: () => Promise<void>;
  };

  /**
   * The social media profiles of the organ. These are
   * URLs that are associated with the organ.
   */
  public socials: {
    /**
     * Gets the social media profiles of the organ.
     * @returns A promise that resolves to the social media profiles of the organ.
     */
    get: (refresh?: boolean) => Promise<organ.OrganSocials[]>;
    /**
     * Adds a social media profile to the organ.
     * @param platform The platform of the social media profile.
     * @param url The URL of the social media profile.
     * @returns A promise that resolves when the social media profile is added.
     */
    add: (platform: SocialsPlatforms, url: string) => Promise<organ.OrganSocials|null>;
    /**
     * Updates a social media profile of the organ.
     * @param sid The ID of the social media profile to update.
     * @param platform The new platform of the social media profile.
     * @param url The new URL of the social media profile.
     * @returns A promise that resolves when the social media profile is updated.
     */
    update: (sid: number, platform: SocialsPlatforms, url: string) => Promise<void>;
    /**
     * Removes a social media profile of the organ.
     * @param sid The ID of the social media profile to remove.
     * @returns A promise that resolves when the social media profile is removed.
     */
    remove: (sid: number) => Promise<void>;
  };
  
  /**
   * Mutex for socials operations.
   */
  private socials_mutex = new Mutex();

  /**
   * The sources of the organ. These are URLs that are
   * associated with the organ.
   */
  public sources: {
    /**
     * Gets the sources of the organ.
     * @returns A promise that resolves to the sources of the organ.
     */
    get: (refresh?: boolean) => Promise<organ.OrganSource[]>;
    /**
     * Adds a source to the organ.
     * @param url The URL of the source to add.
     */
    add: (url: string) => Promise<organ.OrganSource|null>;
    /**
     * Updates a source of the organ.
     * @param sid The ID of the source to update.
     * @param url The new URL of the source.
     * @returns A promise that resolves when the source is updated.
     */
    update: (sid: number, url: string) => Promise<void>;
    /**
     * Removes a source of the organ.
     * @param sid The ID of the source to remove.
     * @returns A promise that resolves when the source is removed.
     */
    remove: (sid: number) => Promise<void>;
  }

  /**
   * Mutex for sources operations.
   */
  private sources_mutex = new Mutex();

  /**
   * The memberships of the organ.
   */
  public memberships: {
    /**
     * Gets the memberships of the organ.
     * @param refresh Whether to refresh the cache.
     * @returns A promise that resolves to the memberships of the organ.
     */
    get: (refresh?: boolean) => Promise<Membership[]>;
    /**
     * Adds a membership to the organ.
     * @param membership The membership to add.
     * @param sources The sources for the membership.
     * @returns A promise that resolves when the membership is added.
     */
    add: (membership: Membership, sources: string[]) => Promise<void>;
    /**
     * Updates a membership of the organ.
     * @param membership The membership to update.
     * @returns A promise that resolves when the membership is updated.
     */
    update: (membership: Membership) => Promise<void>;
    /**
     * Removes a membership of the organ.
     * @param membership The membership to remove.
     * @returns A promise that resolves when the membership is removed.
     */
    remove: (membership: Membership) => Promise<void>;
    /**
     * The sources of the membership.
     */
    sources: {
      get: (membership: Membership) => Promise<organ.MembershipSource[]>;
    };
  };

  /**
   * Mutex for memberships operations.
   */
  private memberships_mutex = new Mutex();

  /**
   * Cache for socials and sources.
   */
  protected cache: OrganCache = {};

  public constructor (id: number, bio: string) {
    this.id = id;
    this.bio = bio;

    this.pic = {
      get: async () => {
        return await organ.pic(this.id);
      },
      src: () => `${API}/organ/${this.id}/pic#${this._vref.value}`,
      set: async (pic: Blob) => {
        await organ.pic.set(this.id, pic);
        this.triggerChange();
      },
      remove: async () => {
        await organ.pic.remove(this.id);
        this.triggerChange();
      },
    };

    this.socials = {
      get: async (refresh?: boolean) => {
        const release = await this.socials_mutex.acquire();
        if (refresh || !this.cache.socials) {
          const res = await organ.socials(this.id);
          this.cache.socials = res.socials ? res.socials : [];
        }
        release();
        return this.cache.socials;
      },
      add: async (platform: SocialsPlatforms, url: string) => {
        const res = await organ.socials.add(this.id, platform, url);
        return res.social ? { id: res.social.id, platform, url } : null;
      },
      update: async (sid: number, platform: SocialsPlatforms, url: string) => {
        await organ.socials.update(this.id, sid, platform, url);
      },
      remove: async (sid: number) => {
        await organ.socials.remove(this.id, sid);
      },
    };

    this.sources = {
      get: async (refresh?: boolean) => {
        const release = await this.sources_mutex.acquire();
        if (refresh || !this.cache.sources) {
          const res = await organ.sources(this.id);
          this.cache.sources = res.sources ? res.sources : [];
        }
        release();
        return this.cache.sources;
      },
      add: async (url: string) => {
        const res = await organ.sources.add(this.id, url);
        return res.source ? { sid: res.source.sid, url } : null;
      },
      update: async (sid: number, url: string) => {
        await organ.sources.update(this.id, sid, url);
      },
      remove: async (sid: number) => {
        await organ.sources.remove(this.id, sid);
      },
    };

    this.memberships = {
      get: async (refresh?: boolean) => {
        const release = await this.memberships_mutex.acquire();
        if (refresh || !this.cache.memberships) {
          // Lazy import to avoid circular dependencies ... :o
          const Organization = (await import('./Organization')).default;
          const Membership = (await import('./Membership')).default;
          const res = await organ.memberships(this.id);
          this.cache.memberships = res.memberships ? res.memberships.map((m: organ.OrganMembership) => new Membership(
            m.id,
            this,
            new Organization(
              m.organization.id, 
              m.organization.bio,
              m.organization.name,
              m.organization.established,
              m.organization.dissolved
            ),
            new Role(
              m.role.id, 
              m.role.name
            ),
            m.since ? new Date(m.since) : undefined,
            m.until ? new Date(m.until) : undefined
          )) : [];
        }
        release();
        return this.cache.memberships;
      },
      add: async (membership: Membership, sources: string[]) => {
        await organ.memberships.add(sources, this, membership.organization, membership.role, membership.since, membership.until);
      },
      update: async (membership: Membership) => {
        await organ.memberships.update(this, membership.id, membership.role, membership.since, membership.until);
      },
      remove: async (membership: Membership) => {
        await organ.memberships.remove(this, membership.id);
      },
      sources: {
        get: async (membership: Membership) => {
          const res = await organ.memberships.sources(this, membership.id);
          return res.sources ? res.sources : [];
        },
      },
    };

    this._vref = ref(Math.floor(Math.random() * 1000));
  }

  /**
   * Helper for Vue reactivity?
   */
  public triggerChange(): void {
    this._vref.value = Math.floor(Math.random()*1000);
  }

  /**
   * **Important**: Note that this doesn't return sanitized
   * HTML - i.e. vulnerable to XSS and stuff. Make sure to
   * sanitize it before rendering it in the browser (e.g.
   * using `DOMPurify` or something similar - i.e. via
   * using the `v-dompurify-html` attribute of the tag).
   * @returns The bio of the organ, rendered as HTML.
   */
  public async bioHTML (): Promise<string> {
    return marked(this.bio);
  }

  public get fullName (): string {
    return '';
  }

  /**
   * Converts the organ to a JSON object.
   * @returns The organ as a JSON object.
   */
  public json (): organ.Organ {
    return {
      id: this.id,
      bio: this.bio,
    };
  }

  /**
   * Parses an organ from JSON.
   * @param json The JSON to parse.
   * @returns The parsed organ.
   */
  public static parse (json: organ.Organ): Organ {
    return new Organ(json.id, json.bio);
  }

  /**
   * Converts the organ to a string.
   * @returns The organ as a string.
   */
  public toString (): string {
    return `Organ#${this.id}`;
  }

  /**
   * Updates the organ.
   * @returns A promise that resolves when the organ is updated.
   */
  public async update (): Promise<void> {
  }

  /**
   * Fetches an organ by its ID.
   * @param id The ID of the organ to fetch.
   * @returns A promise that resolves to the organ fetched.
   */
  public static async get (id: number): Promise<Organ|null> {
    const res = await organ.get(id);
    return res.organ ? new Organ(res.organ.id, res.organ.bio) : null;
  }

  /**
   * Creates a new organ.
   * @param bio The bio of the organ.
   * @param args Any additional arguments (for children to use).
   * @returns A promise that resolves to the organ created.
   */
  public static async create (bio: string, ...args: any[]): Promise<Organ|null> {
    const res = await organ.create(bio);
    return res.organ ? new Organ(res.organ.id, res.organ.bio) : null;
  }
}

export default Organ;
