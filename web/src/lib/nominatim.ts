/**
 * Functions for interacting with the Nominatim API.
 */

export const API = 'https://nominatim.openstreetmap.org';

/**
 * Search for a location using the Nominatim API.
 * @param query The search query.
 * @returns A list of GeoJSON features representing the search results.
 */
export const search = async (query: string, polygon?: boolean): Promise<GeoJSON.Feature[]> => {
  const res = await fetch(`${API}/search?q=${query}&format=geojson${polygon ? '&polygon_geojson=1' : ''}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.features as GeoJSON.Feature[];
};
