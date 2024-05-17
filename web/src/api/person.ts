import { API, jreq } from './index';
import type { Organ } from './organ';
import type { APIResponse } from './index';

/**
 * Represents a person.
 */
export interface Person extends Organ {
  /**
   * The ID of the person. This is unique across all people.
   */
  id: number;
  /**
   * The first name of the person.
   */
  firstname: string;
  /**
   * The last name of the person.
   */
  lastname: string;
  /**
   * The date of birth of the person.
   */
  birthdate?: Date;
  /**
   * The date of death of the person.
   */
  deathdate?: Date;
}

/**
 * Represents the relation of a specific person to another person.
 */
export interface PersonRelation {
  /**
   * The person that the relation is with.
   */
  to: Person;
  /**
   * The date that the relation started.
   */
  since: Date;
  /**
   * The date that the relation ended.
   */
  until?: Date;
}

/**
 * Represents a relation between two people.
 * Relations are identified by their `from`, `to`, and `since` fields.
 */
export interface Relation {
  /**
   * The ID of the relation. This is unique across all relations.
   */
  id: number;
  /**
   * The person that the relation is from.
   */
  from: Person;
  /**
   * The person that the relation is to.
   */
  to: Person;
  /**
   * The date that the relation started.
   */
  since: Date;
  /**
   * The date that the relation ended.
   */
  until?: Date;
}

/**
 * Represents a source for a relation.
 */
export interface RelationSource {
  /**
   * The ID of the source. This is unique across all sources.
   */
  sid: number;
  /**
   * The URL of the source.
   */
  url: string;
}

/**
 * Represents a response from the API for a person.
 */
export interface PersonResponse extends APIResponse {
  person?: Person;
}

/**
 * 
 */
export interface PeopleResponse extends APIResponse {
  people: Person[];
}

/**
 * Represents a response from the API for the parents of a person.
 */
export interface ParentsResponse extends APIResponse {
  parents?: PersonRelation[];
}

/**
 * Represents a response from the API for the children of a person.
 */
export interface ChildrenResponse extends APIResponse {
  children?: PersonRelation[];
}

/**
 * Represents a response from the API for the romantic relations of a person.
 */
export interface RomanticResponse extends APIResponse {
  romantic?: PersonRelation[];
}

/**
 * Represents a response from the API for the friends of a person.
 */
export interface FriendsResponse extends APIResponse {
  friends?: PersonRelation[];
}

/**
 * Represents a response from the API for the sources of a relation.
 */
export interface RelationSourcesResponse extends APIResponse {
  sources?: RelationSource[];
}

/**
 * Represents a response from the API for a source of a relation.
 */
export interface RelationSourceResponse extends APIResponse {
  source?: RelationSource;
}

/**
 * Creates a new person.
 * @param firstname The first name of the person.
 * @param lastname The last name of the person.
 * @param bio The biography of the person.
 * @param birthdate The date of birth of the person.
 * @param deathdate The date of death of the person.
 * @returns The response from the API containing the person.
 */
export const create = async (
  firstname: string, 
  lastname: string, 
  bio: string,
  birthdate?: Date,
  deathdate?: Date
): Promise<PersonResponse> => {
  return await jreq(`${API}/person`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, bio, birthdate, deathdate, }),
  }) as PersonResponse;
}

/**
 * Gets a person by their ID.
 * @param pid The ID of the person.
 * @returns The response from the API containing the person.
 */
export const get = async (pid: number): Promise<PersonResponse> => {
  const res = await jreq(`${API}/person/${pid}`) as PersonResponse;
  if (res.person) {
    res.person.birthdate = res.person.birthdate ? new Date(res.person.birthdate) : undefined;
    res.person.deathdate = res.person.deathdate ? new Date(res.person.deathdate) : undefined;
  }
  return res;
}

export const update = async (
  pid: number,
  firstname: string,
  lastname: string,
  bio: string,
  birthdate?: Date,
  deathdate?: Date
): Promise<PersonResponse> => {
  return await jreq(`${API}/person/${pid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, bio, birthdate, deathdate }),
  }) as PersonResponse;
}

/**
 * Searches for people by their names.
 * @param query The query to search for.
 * @returns The response from the API containing the people that match the query.
 */
export const search = async (query: string): Promise<PeopleResponse> => {
  const res = await jreq(`${API}/person?q=${query}`) as PeopleResponse;
  res.people.forEach(p => {
    p.birthdate = p.birthdate ? new Date(p.birthdate) : undefined;
    p.deathdate = p.deathdate ? new Date(p.deathdate) : undefined;
  });
  return res;
}

/**
 * Gets a person's parents.
 * @param pid The ID of the person.
 * @returns The response from the API containing the parents of the person.
 */
export const parents = async (pid: number): Promise<ParentsResponse> => {
  const res = await jreq(`${API}/person/${pid}/parents`) as ParentsResponse;
  if (res.parents) {
    res.parents.forEach(p => {
      p.to.birthdate = p.to.birthdate ? new Date(p.to.birthdate) : undefined;
      p.to.deathdate = p.to.deathdate ? new Date(p.to.deathdate) : undefined;
      p.since = new Date(p.since);
      p.until = p.until ? new Date(p.until) : undefined;
    });
  }
  return res;
}

/**
 * Gets a person's children.
 * @param pid The ID of the person.
 * @returns The response from the API containing the children of the person.
 */
export const children = async (pid: number): Promise<ChildrenResponse> => {
  const res = await jreq(`${API}/person/${pid}/children`) as ChildrenResponse;
  if (res.children) {
    res.children.forEach(c => {
      c.to.birthdate = c.to.birthdate ? new Date(c.to.birthdate) : undefined;
      c.to.deathdate = c.to.deathdate ? new Date(c.to.deathdate) : undefined;
      c.since = new Date(c.since);
      c.until = c.until ? new Date(c.until) : undefined;
    });
  }
  return res;
}

/**
 * Gets a person's romantic relations.
 * @param pid The ID of the person.
 * @returns The response from the API containing the romantic relations of the person.
 */
export const romantic = async (pid: number): Promise<RomanticResponse> => {
  const res = await jreq(`${API}/person/${pid}/romantic`) as RomanticResponse;
  if (res.romantic) {
    res.romantic.forEach(r => {
      r.to.birthdate = r.to.birthdate ? new Date(r.to.birthdate) : undefined;
      r.to.deathdate = r.to.deathdate ? new Date(r.to.deathdate) : undefined;
      r.since = new Date(r.since);
      r.until = r.until ? new Date(r.until) : undefined;
    });
  }
  return res;
}

/**
 * Gets a person's friends.
 * @param pid The ID of the person.
 * @returns The response from the API containing the friends of the person.
 */
export const friends = async (pid: number): Promise<FriendsResponse> => {
  const res = await jreq(`${API}/person/${pid}/friends`) as FriendsResponse;
  if (res.friends) {
    res.friends.forEach(f => {
      f.to.birthdate = f.to.birthdate ? new Date(f.to.birthdate) : undefined;
      f.to.deathdate = f.to.deathdate ? new Date(f.to.deathdate) : undefined;
      f.since = new Date(f.since);
      f.until = f.until ? new Date(f.until) : undefined;
    });
  }
  return res;
}

/**
 * Interact with the person's relations.
 */
export const rel = {
  /**
   * Adds a relation to a person.
   * @param type The type of relation.
   * @param pid The ID of the person.
   * @param other The ID of the other person.
   * @param sources The sources of the relation.
   * @param since The date the relation started.
   * @param until The date the relation ended.
   * @returns The response from the API.
   */
  add: async (type: number, pid: number, other: number, sources: string[], since: Date, until?: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, other, since, until, sources, }),
    });
  },

  /**
   * Updates a relation of a person.
   * @param type The type of relation.
   * @param pid The ID of the person.
   * @param other The ID of the other person.
   * @param since The date the relation started.
   * @param until The date the relation ended.
   * @returns The response from the API.
   */
  update: async (type: number, pid: number, other: number, since: Date, until?: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, other, since, until }),
    });
  },

  /**
   * Removes a relation from a person.
   * @param type The type of relation.
   * @param pid The ID of the person.
   * @param other The ID of the other person.
   * @param since The date the relation started.
   * @returns The response from the API.
   */
  remove: async (type: number, pid: number, other: number, since: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, other, since, }),
    });
  },
};

/**
 * Get the sources of a relation.
 * @param pid The ID of the person.
 * @param other The ID of the other person.
 * @param since The date the relation started.
 * @returns The response from the API containing the sources of the relation.
 */
export const rel_sources = async (pid: number, other: number, since: Date): Promise<RelationSourcesResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources?other=${other}&since=${since.toISOString()}`) as RelationSourcesResponse;
};

/**
 * Add a source to a relation.
 * @param pid The ID of the person.
 * @param other The ID of the other person.
 * @param since The date the relation started.
 * @param url The URL of the source.
 * @returns The response from the API containing the new source.
 */
rel_sources.add = async (pid: number, other: number, since: Date, url: string): Promise<RelationSourceResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ other, since, url }),
  }) as RelationSourceResponse;
}

/**
 * Updates a source for a relation.
 * @param pid The ID of the person.
 * @param sid The ID of the source.
 * @param url The new URL of the source.
 * @returns The response from the API.
 */
rel_sources.update = async (pid: number, sid: number, url: string): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources/${sid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

/**
 * Removes a source from a relation.
 * @param pid The ID of the person.
 * @param sid The ID of the source.
 * @returns The response from the API.
 */
rel_sources.remove = async (pid: number, sid: number): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources/${sid}`, {
    method: 'DELETE',
  });
}
