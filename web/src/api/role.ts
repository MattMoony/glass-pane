import { API, jreq, type APIResponse } from './index';

export interface Role {
  id: number;
  name: string;
}

export interface RoleResponse extends APIResponse {
  role?: Role;
}

export interface RolesResponse extends APIResponse {
  roles: Role[];
}

export interface NewRoleResponse extends RoleResponse {
}

export interface UpdateRoleResponse extends RoleResponse {
}

export interface RemoveRoleResponse extends APIResponse {
}

export const create = async (name: string): Promise<NewRoleResponse> => {
  return await jreq(`${API}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as NewRoleResponse;
};

export const search = async (name: string): Promise<RolesResponse> => {
  return await jreq(`${API}/role/search?name=${name}`) as RolesResponse;
};

export const get = async (rid: number): Promise<RoleResponse> => {
  return await jreq(`${API}/role/${rid}`) as RoleResponse;
};

export const update = async (rid: number, name: string): Promise<UpdateRoleResponse> => {
  return await jreq(`${API}/role/${rid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as UpdateRoleResponse;
};

export const remove = async (rid: number): Promise<RemoveRoleResponse> => {
  return await jreq(`${API}/role/${rid}`, {
    method: 'DELETE',
  }) as RemoveRoleResponse;
};
