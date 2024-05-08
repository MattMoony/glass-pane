import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Organ } from './organ';

/**
 * Represents an organization.
 */
export interface Organization extends Organ {
  /**
   * The ID of the organization. This is unique across all organizations.
   */
  id: number;
  /**
   * The name of the organization.
   */
  name: string;
  /**
   * The date the organization was established.
   */
  established?: Date;
  /**
   * The date the organization was dissolved.
   */
  dissolved?: Date;
}

/**
 * Represents a response from the API for an organization.
 */
export interface OrganizationResponse extends APIResponse {
  organization?: Organization;
}

/**
 * Represents a response from the API for multiple organizations.
 */
export interface OrganizationsResponse extends APIResponse {
  organizations: Organization[];
}

/**
 * Creates a new organization.
 * @param name The name of the organization.
 * @param bio The biography of the organization.
 * @param established The date the organization was established.
 * @param dissolved The date the organization was dissolved.
 * @returns The response from the API containing the organization.
 */
export const create = async (
  name: string, 
  bio: string,
  established?: Date, 
  dissolved?: Date
): Promise<OrganizationResponse> => {
  return await jreq(`${API}/organization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bio, established, dissolved }),
  }) as OrganizationResponse;
};

/**
 * Gets an organization by its ID.
 * @param oid The ID of the organization.
 * @returns The response from the API containing the organization.
 */
export const get = async (oid: number): Promise<OrganizationResponse> => {
  const res = await jreq(`${API}/organization/${oid}`) as OrganizationResponse;
  if (res.organization) {
    res.organization.established = res.organization.established ? new Date(res.organization.established) : undefined;
    res.organization.dissolved = res.organization.dissolved ? new Date(res.organization.dissolved) : undefined;
  }
  return res;
}

/**
 * Searches for organizations by name.
 * @param name The name to search for.
 * @returns The response from the API containing the organizations that match the query.
 */
export const search = async (name: string): Promise<OrganizationsResponse> => {
  const res = await jreq(`${API}/organization?q=${name}`) as OrganizationsResponse;
  res.organizations.forEach(o => {
    o.established = o.established ? new Date(o.established) : undefined;
    o.dissolved = o.dissolved ? new Date(o.dissolved) : undefined;
  });
  return res;
}

/**
 * Updates an organization.
 * @param oid The ID of the organization.
 * @param name The name of the organization.
 * @param bio The biography of the organization.
 * @param established The date the organization was established.
 * @param dissolved The date the organization was dissolved.
 * @returns The response from the API containing the updated organization.
 */
export const update = async (
  oid: number,
  name: string,
  bio: string,
  established?: Date,
  dissolved?: Date
): Promise<OrganizationResponse> => {
  return await jreq(`${API}/organization/${oid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bio, established, dissolved }),
  }) as OrganizationResponse;
};

/**
 * Removes an organization.
 * @param oid The ID of the organization.
 * @returns The response from the API.
 */
export const remove = async (oid: number): Promise<APIResponse> => {
  return await jreq(`${API}/organization/${oid}`, { method: 'DELETE' }) as APIResponse;
};
