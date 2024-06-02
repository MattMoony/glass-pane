import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Organization } from './organization';

/**
 * Represents a nation.
 */
export interface Nation extends Organization {
  /**
   * The geographic area of the nation.
   */
  geo?: GeoJSON.Polygon;
}

/**
 * Represents a response from the API for a nation.
 */
export interface NationResponse extends APIResponse {
  nation?: Nation;
}

/**
 * Represents a response from the API for multiple nations.
 */
export interface NationsResponse extends APIResponse {
  nations: Nation[];
}

/**
 * Creates a new nation.
 * @param name The name of the nation.
 * @param bio The biography of the nation.
 * @param established The date the nation was established.
 * @param dissolved The date the nation was dissolved.
 * @param location The ID of the location (capital) of the nation.
 * @param geo The geographic area of the nation.
 * @returns The response from the API containing the nation.
 */
export const create = async (
  name: string,
  bio: string,
  established?: Date,
  dissolved?: Date,
  location?: number,
  geo?: GeoJSON.Polygon
): Promise<NationResponse> => {
  const res = await jreq(`${API}/nation`, {
    method: 'POST',
    body: JSON.stringify({ name, bio, established, dissolved, location, geo, }),
    credentials: 'include',
  }) as NationResponse;
  if (res.nation) {
    res.nation.established = res.nation.established ? new Date(res.nation.established) : undefined;
    res.nation.dissolved = res.nation.dissolved ? new Date(res.nation.dissolved) : undefined;
  }
  return res;
};

/**
 * Gets a nation by its ID.
 * @param nid The ID of the nation.
 * @returns The response from the API containing the nation.
 */
export const get = async (nid: number): Promise<NationResponse> => {
  const res = await jreq(`${API}/nation/${nid}`) as NationResponse;
  if (res.nation) {
    res.nation.established = res.nation.established ? new Date(res.nation.established) : undefined;
    res.nation.dissolved = res.nation.dissolved ? new Date(res.nation.dissolved) : undefined;
  }
  return res;
};

/**
 * Searches for nations by name.
 * @param q The query string to search for.
 * @returns The response from the API containing the nations that match the query.
 */
export const search = async (q: string): Promise<NationsResponse> => {
  const res = await jreq(`${API}/nation?q=${q}`) as NationsResponse;
  res.nations.forEach(nation => {
    nation.established = nation.established ? new Date(nation.established) : undefined;
    nation.dissolved = nation.dissolved ? new Date(nation.dissolved) : undefined;
  });
  return res;
};

/**
 * Updates a nation.
 * @param nid The ID of the nation.
 * @param name The name of the nation.
 * @param bio The biography of the nation.
 * @param established The date the nation was established.
 * @param dissolved The date the nation was dissolved.
 * @param location The ID of the location (capital) of the nation.
 * @param geo The geographic area of the nation.
 * @returns The response from the API containing the updated nation.
 */
export const update = async (
  nid: number,
  name: string,
  bio: string,
  established?: Date,
  dissolved?: Date,
  location?: number,
  geo?: GeoJSON.Polygon
): Promise<NationResponse> => {
  const res = await jreq(`${API}/nation/${nid}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, bio, established, dissolved, location, geo, }),
    credentials: 'include',
  }) as NationResponse;
  if (res.nation) {
    res.nation.established = res.nation.established ? new Date(res.nation.established) : undefined;
    res.nation.dissolved = res.nation.dissolved ? new Date(res.nation.dissolved) : undefined;
  }
  return res;
};

/**
 * Removes a nation.
 * @param nid The ID of the nation.
 * @returns The response from the API.
 */
export const remove = async (nid: number): Promise<APIResponse> => {
  return await jreq(`${API}/nation/${nid}`, {
    method: 'DELETE',
    credentials: 'include',
  });
};
