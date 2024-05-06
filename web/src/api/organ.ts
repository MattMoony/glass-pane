import { API, jreq } from './index';
import type { APIResponse } from './index';

export interface Organ {
  id: number;
  bio: string;
}

export interface OrganSource {
  sid: number;
  url: string;
}

export interface OrganResponse extends APIResponse {
  organ?: Organ;
}

export interface NewOrganResponse extends APIResponse {
  id?: number;
}

export interface OrganSourcesResponse extends APIResponse {
  sources?: OrganSource[];
}

export interface NewOrganSourceResponse extends NewOrganResponse {
}

export interface UpdateOrganSourceResponse extends APIResponse {
}

export interface RemoveOrganSourceResponse extends APIResponse {
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

export { sources };
