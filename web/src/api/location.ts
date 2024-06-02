import { API, jreq } from './index';
import type { APIResponse } from './index';

/**
 * Represents a location.
 */
export interface Location {
  /**
   * The ID of the location.
   */
  id: number;
  /**
   * The name of the location.
   */
  name: string;
  /**
   * The geographic coordinates of the location.
   */
  coords: GeoJSON.Point;
}

/**
 * Represents a response from the API for a location.
 */
export interface LocationResponse extends APIResponse {
  location?: Location;
}

/**
 * Represents a response from the API for multiple locations.
 */
export interface LocationsResponse extends APIResponse {
  locations: Location[];
}

/**
 * Creates a new location.
 * @param name The name of the location.
 * @param coords The geographic coordinates of the location.
 * @returns The response from the API containing the location.
 */
export const create = async (
  name: string,
  coords: GeoJSON.Point
): Promise<LocationResponse> => {
  const res = await jreq(`${API}/location`, {
    method: 'POST',
    body: JSON.stringify({ name, coords, }),
    credentials: 'include',
  }) as LocationResponse;
  return res;
};

/**
 * Gets a location by its ID.
 * @param lid The ID of the location.
 * @returns The response from the API containing the location.
 */
export const get = async (
  lid: number
): Promise<LocationResponse> => {
  return await jreq(`${API}/location/${lid}`);
}

/**
 * Searches for locations by name.
 * @param name The name of the location.
 * @returns The response from the API containing the locations.
 */
export const search = async (
  name: string
): Promise<LocationsResponse> => {
  return await jreq(`${API}/location/search/${name}`) as LocationsResponse;
};

/**
 * Updates a location.
 * @param lid The ID of the location.
 * @param name The name of the location.
 * @param coords The geographic coordinates of the location.
 * @returns The response from the API containing the location.
 */
export const update = async (
  lid: number,
  name: string,
  coords: GeoJSON.Point
): Promise<LocationResponse> => {
  const res = await jreq(`${API}/location/${lid}`, {
    method: 'PUT',
    body: JSON.stringify({ name, coords, }),
    credentials: 'include',
  }) as LocationResponse;
  return res;
};

/**
 * Deletes a location.
 * @param lid The ID of the location.
 * @returns The response from the API.
 */
export const remove = async (
  lid: number
): Promise<APIResponse> => {
  return await jreq(`${API}/location/${lid}`, {
    method: 'DELETE',
    credentials: 'include',
  }) as APIResponse;
};
