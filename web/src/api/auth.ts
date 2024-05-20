import { API, jreq } from './index';
import type { APIResponse } from './index';

/**
 * Represents a user.
 */
export interface BriefUser {
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
 * Represents a user.
 */
export interface User extends BriefUser {
  /**
   * The user's token.
   */
  token: string;
};

/**
 * The response from the status endpoint.
 */
export interface StatusResponse extends APIResponse {
  /**
   * The user.
   */
  user?: BriefUser;
};

/**
 * The response from the login endpoint.
 */
export interface LoginResponse extends APIResponse {
  /**
   * The user.
   */
  user?: User;
};

/**
 * Gets the status of the user.
 * @param token The user's token.
 * @returns The response from the status endpoint.
 */
export const status = async (token: string): Promise<StatusResponse> => {
  return await jreq(`${API}/auth/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }) as StatusResponse;
};

/**
 * Logs in a user.
 * @param username The user's username.
 * @param password The user's password.
 * @returns The response from the login endpoint.
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  return await jreq(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ username, password }),
  }) as LoginResponse;
};
