/**
 * Module for interacting with the API.
 */
export const API = 'http://localhost:8888/api';

export interface APIResponse {
  success: boolean;
  msg?: string;
}

export const jreq = async (...args: any[]): Promise<APIResponse> => {
  const res = await fetch(...args);
  if (!res.ok) return { success: false, msg: res.statusText, };
  return await res.json();
};
