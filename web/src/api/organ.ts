import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Person } from './person';
import type { Organization } from './organization';
import type { Role } from './role';

export interface Organ {
  id: number;
  bio: string;
}

export interface OrganSource {
  sid: number;
  url: string;
}

export interface Membership {
  role: Role;
  organization: Organization;
  organ: Organ;
  since: Date;
  until?: Date;
}

export interface OrganMembership {
  role: Role;
  organization: Organization;
  since: Date;
  until?: Date;
}

export interface OrganResponse extends APIResponse {
  organ?: Organ;
}

export interface OrgansResponse extends APIResponse {
  people: Person[];
  organizations: Organization[];
}

export interface NewOrganResponse extends OrganResponse {
}

export interface OrganSourcesResponse extends APIResponse {
  sources?: OrganSource[];
}

export interface OrganSourceResponse extends APIResponse {
  source?: OrganSource;
}

export interface NewOrganSourceResponse extends OrganSourceResponse {
}

export interface UpdateOrganSourceResponse extends APIResponse {
}

export interface RemoveOrganSourceResponse extends APIResponse {
}

export interface OrganMembershipsResponse extends APIResponse {
  memberships: OrganMembership[];
}

export const create = async (bio: string): Promise<NewOrganResponse> => {
  return await jreq(`${API}/organ/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio }),
  }) as NewOrganResponse;
};

export const get = async (oid: number): Promise<OrganResponse> => {
  return await jreq(`${API}/organ/${oid}`) as OrganResponse;
};

export const search = async (query: string): Promise<OrgansResponse> => {
  return await jreq(`${API}/organ?q=${query}`) as OrgansResponse;
}

export const pic = async (oid: number): Promise<Blob> => {
  return await fetch(`${API}/organ/${oid}/pic`).then(res => res.blob());
}

pic.set = async (oid: number, pic: Blob): Promise<APIResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/organ/${oid}/pic`, {
    method: 'POST',
    body: formData,
  });
}

pic.remove = async (oid: number): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/pic`, {
    method: 'DELETE',
  });
}

const sources = async (oid: number): Promise<OrganSourcesResponse> => {
  return await jreq(`${API}/organ/${oid}/sources`) as OrganSourcesResponse;
};

sources.add = async (oid: number, url: string): Promise<NewOrganSourceResponse> => {
  return await jreq(`${API}/organ/${oid}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }) as NewOrganSourceResponse;
};

sources.update = async (oid: number, sid: number, url: string): Promise<UpdateOrganSourceResponse> => {
  return await jreq(`${API}/organ/${oid}/sources/${sid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }) as UpdateOrganSourceResponse;
};

sources.remove = async (oid: number, sid: number): Promise<RemoveOrganSourceResponse> => {
  return await jreq(`${API}/organ/${oid}/sources/${sid}`, {
    method: 'DELETE',
  }) as RemoveOrganSourceResponse;
};

export const memberships = async (oid: number): Promise<OrganMembershipsResponse> => {
  const res = await jreq(`${API}/organ/${oid}/memberships`) as OrganMembershipsResponse;
  if (res.memberships) {
    res.memberships.forEach((m: OrganMembership) => {
      m.organization.established = m.organization.established ? new Date(m.organization.established) : undefined;
      m.organization.dissolved = m.organization.dissolved ? new Date(m.organization.dissolved) : undefined;
      m.since = new Date(m.since);
      m.until = m.until ? new Date(m.until) : undefined;
    });
  }
  return res;
};

export { sources };
