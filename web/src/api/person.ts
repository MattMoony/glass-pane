import { API, jreq } from './index';
import type { Organ } from './organ';
import type { APIResponse } from './index';

export interface Person extends Organ {
  id: number;
  firstname: string;
  lastname: string;
  birthdate?: Date;
  deathdate?: Date;
}

export interface Relation {
  from: Person;
  to: Person;
  since: Date;
  until?: Date;
}

export interface AbbrRelation {
  to: Person;
  since: Date;
  until?: Date;
}

export interface RelationSource {
  sid: number;
  url: string;
}

export interface PersonResponse extends APIResponse {
  person?: Person;
}

export interface NewPersonResponse extends PersonResponse {
}

export interface ParentsResponse extends APIResponse {
  parents?: AbbrRelation[];
}

export interface ChildrenResponse extends APIResponse {
  children?: AbbrRelation[];
}

export interface RomanticResponse extends APIResponse {
  romantic?: AbbrRelation[];
}

export interface FriendsResponse extends APIResponse {
  friends?: AbbrRelation[];
}

export interface RelationSourcesResponse extends APIResponse {
  sources?: RelationSource[];
}

export interface NewRelationSourceResponse extends APIResponse {
  source?: RelationSource;
}

export const create = async (
  firstname: string, 
  lastname: string, 
  bio: string,
  birthdate?: Date,
  deathdate?: Date
): Promise<NewPersonResponse> => {
  return await jreq(`${API}/person/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, bio, birthdate, deathdate, }),
  }) as NewPersonResponse;
}

export const get = async (pid: number): Promise<PersonResponse> => {
  const res = await jreq(`${API}/person/${pid}`) as PersonResponse;
  if (res.person) {
    res.person.birthdate = res.person.birthdate ? new Date(res.person.birthdate) : undefined;
    res.person.deathdate = res.person.deathdate ? new Date(res.person.deathdate) : undefined;
  }
  return res;
}

export const pic = async (pid: number): Promise<Blob> => {
  return await fetch(`${API}/person/${pid}/pic`).then(res => res.blob());
}

pic.set = async (pid: number, pic: Blob): Promise<APIResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/person/${pid}/pic`, {
    method: 'POST',
    body: formData,
  });
}

pic.remove = async (pid: number): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/pic`, {
    method: 'DELETE',
  });
}

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

export const rel = {
  add: async (type: string, pid: number, to: number, since: Date, until?: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, since, until, }),
    });
  },

  update: async (pid: number, to: number, since: Date, until?: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, since, until }),
    });
  },

  remove: async (pid: number, to: number, since: Date): Promise<APIResponse> => {
    return await jreq(`${API}/person/${pid}/relation`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, since, }),
    });
  },
};

export const rel_sources = async (pid: number, to: number, since: Date): Promise<RelationSourcesResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources?to=${to}&since=${since.toISOString()}`) as RelationSourcesResponse;
};

rel_sources.add = async (pid: number, to: number, since: Date, url: string): Promise<NewRelationSourceResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, since, url }),
  }) as NewRelationSourceResponse;
}

rel_sources.update = async (pid: number, to: number, sid: number, url: string): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources/${sid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

rel_sources.remove = async (pid: number, sid: number): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/relation/sources/${sid}`, {
    method: 'DELETE',
  });
}
