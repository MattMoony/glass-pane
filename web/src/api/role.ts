import { API, jreq, type APIResponse } from './index';

/**
 * Represents a role in an organization.
 */
export interface Role {
  /**
   * The ID of the role. This is unique across all roles.
   */
  id: number;
  /**
   * The name of the role.
   */
  name: string;
}

/**
 * Represents a response from the API for a role.
 */
export interface RoleResponse extends APIResponse {
  role?: Role;
}

/**
 * Represents a response from the API for multiple roles.
 */
export interface RolesResponse extends APIResponse {
  roles: Role[];
}

/**
 * Creates a new role.
 * @param name The name of the role.
 * @returns A promise that resolves to the response from the API.
 */
export const create = async (name: string): Promise<RoleResponse> => {
  return await jreq(`${API}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as RoleResponse;
};

/**
 * Searches for roles by name.
 * @param name The name to search for.
 * @returns A promise that resolves to the response from the API.
 */
export const search = async (name: string): Promise<RolesResponse> => {
  return await jreq(`${API}/role?q=${name}`) as RolesResponse;
};

/**
 * Gets a role by its ID.
 * @param rid The ID of the role to get.
 * @returns A promise that resolves to the response from the API.
 */
export const get = async (rid: number): Promise<RoleResponse> => {
  return await jreq(`${API}/role/${rid}`) as RoleResponse;
};

/**
 * Updates a role.
 * @param rid The ID of the role to update.
 * @param name The new name of the role.
 * @returns A promise that resolves to the response from the API.
 */
export const update = async (rid: number, name: string): Promise<RoleResponse> => {
  return await jreq(`${API}/role/${rid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as RoleResponse;
};

/**
 * Removes a role.
 * @param rid The ID of the role to remove.
 * @returns A promise that resolves to the response from the API.
 */
export const remove = async (rid: number): Promise<APIResponse> => {
  return await jreq(`${API}/role/${rid}`, {
    method: 'DELETE',
  }) as APIResponse;
};
