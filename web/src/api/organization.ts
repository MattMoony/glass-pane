import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Organ } from './organ';
import type { Role } from './role';

export interface Organization extends Organ {
  id: number;
  name: string;
  established?: Date;
  dissolved?: Date;
}

export interface Membership {
  organ: Organ;
  organization: Organization;
  role: Role;
  since: Date;
  until?: Date;
}

export interface MembershipSource {
  sid: number;
  url: string;
}

export interface OrganizationResponse extends APIResponse {
  organization?: Organization;
}

export interface OrganizationsResponse extends APIResponse {
  organizations: Organization[];
}

export interface NewOrganizationResponse extends OrganizationResponse {
}

export interface UpdateOrganizationResponse extends OrganizationResponse {
}

export interface RemoveOrganizationResponse extends APIResponse {
}

export const create = async (
  name: string, 
  bio: string,
  established?: Date, 
  dissolved?: Date
): Promise<NewOrganizationResponse> => {
  return await jreq(`${API}/organization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bio, established, dissolved }),
  }) as NewOrganizationResponse;
};

export const get = async (oid: number): Promise<OrganizationResponse> => {
  const res = await jreq(`${API}/organization/${oid}`) as OrganizationResponse;
  if (res.organization) {
    res.organization.established = res.organization.established ? new Date(res.organization.established) : undefined;
    res.organization.dissolved = res.organization.dissolved ? new Date(res.organization.dissolved) : undefined;
  }
  return res;
}

export const search = async (name: string): Promise<OrganizationsResponse> => {
  const res = await jreq(`${API}/organization?q=${name}`) as OrganizationsResponse;
  res.organizations.forEach(o => {
    o.established = o.established ? new Date(o.established) : undefined;
    o.dissolved = o.dissolved ? new Date(o.dissolved) : undefined;
  });
  return res;
}

export const update = async (
  oid: number,
  name: string,
  bio: string,
  established?: Date,
  dissolved?: Date
): Promise<UpdateOrganizationResponse> => {
  return await jreq(`${API}/organization/${oid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bio, established, dissolved }),
  }) as UpdateOrganizationResponse;
};

export const remove = async (oid: number): Promise<RemoveOrganizationResponse> => {
  return await jreq(`${API}/organization/${oid}`, { method: 'DELETE' }) as RemoveOrganizationResponse;
};
