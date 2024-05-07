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

export interface NewOrganizationResponse extends OrganizationResponse {
}

export const create = async (
  name: string, 
  bio: string,
  established?: Date, 
  dissolved?: Date
): Promise<NewOrganizationResponse> => {
  return await jreq(`${API}/organization/new`, {
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
