/**
 * Module for interacting with the API.
 */
// export const API = 'https://api.watchthe.top/api';
export const API = 'http://localhost:8888/api';

/**
 * The standard format for API responses.
 */
export interface APIResponse {
  success: boolean;
  msg?: string;
}

/**
 * Sends a JSON request to the API. All interactions with
 * the API should go through this function.
 * @param args The arguments to pass to fetch.
 * @returns The response from the API.
 */
export const jreq = async (url: string, ...args: any[]): Promise<APIResponse> => {
  const res = await fetch(url, ...args);
  if (!res.ok) return { success: false, msg: res.statusText, };
  return await res.json();
};
