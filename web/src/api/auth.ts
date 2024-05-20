import { API, jreq } from './index';
import type { APIResponse } from './index';

/**
 * Represents a user.
 */
export interface User {
  /**
   * The user's ID.
   */
  id: number;
  /**
   * The user's username.
   */
  username: string;
};

/**
 * The response from the status endpoint.
 */
export interface StatusResponse extends APIResponse {
  /**
   * The user.
   */
  user?: User;
};

/**
 * Gets the status of the user.
 * @returns The response from the status endpoint.
 */
export const status = async (): Promise<StatusResponse> => {
  return await jreq(`${API}/auth/status`, {
    // TODO: look at this stuff again - especially, when properly hosting
    credentials: 'include',
  }) as StatusResponse;
};

/**
 * Logs in a user.
 * @param username The user's username.
 * @param password The user's password.
 * @returns The response from the login endpoint.
 */
export const login = async (username: string, password: string): Promise<StatusResponse> => {
  return await jreq(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  }) as StatusResponse;
};
