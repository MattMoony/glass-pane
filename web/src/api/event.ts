import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Organ } from './organ';
import type { Location } from './location';

/**
 * Represents an event.
 */
export interface Event {
  /**
   * The ID of the event.
   */
  id: number;
  /**
   * The name of the event.
   */
  name: string;
  /**
   * The description of the event.
   */
  desc: string;
  /**
   * The date of the event.
   */
  date?: Date|null;
  /**
   * The location of the event.
   */
  location?: Location|null;
}

/**
 * A response containing an event.
 */
export interface EventResponse extends APIResponse {
  event?: Event;
}

/**
 * A response containing multiple events.
 */
export interface EventsResponse extends APIResponse {
  events?: Event[];
}

/**
 * A response containing the participants of an event.
 */
export interface ParticipantsResponse extends APIResponse {
  participants?: Organ[];
}

/**
 * Create a new event.
 * @param name The name of the event.
 * @param desc The description of the event.
 * @param date The date of the event.
 * @param location The location of the event.
 * @returns A promise that resolves with the event.
 */
export const create = async (
  name: string, 
  desc: string, 
  date?: Date, 
  location?: number
): Promise<EventResponse> => {
  return await jreq(`${API}/event`, {
    method: 'POST',
    body: JSON.stringify({ name, desc, date, location }),
    credentials: 'include',
  }) as EventResponse;
};

/**
 * Get an event by ID.
 * @param id The ID of the event to get.
 * @returns A promise that resolves with the event.
 */
export const get = async (id: number): Promise<EventResponse> => {
  return await jreq(`${API}/event/${id}`, {
    method: 'GET',
  }) as EventResponse;
};

/**
 * Search for an event.
 * @param query The query to search for.
 * @returns A promise that resolves with the events.
 */
export const search = async (query: string): Promise<EventsResponse> => {
  return await jreq(`${API}/event/search?q=${query}`, {
    method: 'GET',
  }) as EventsResponse;
};

/**
 * Get all events for a participant.
 * @param participant The participant to get events for.
 * @param query The query to search for.
 * @returns A promise that resolves with the events.
 */
export const searchByParticipant = async (
  participant: Organ, 
  query?: string
): Promise<EventsResponse> => {
  return await jreq(`${API}/event?participant=${participant.id}${query ? '&q='+query : ''}`, {
    method: 'GET',
  }) as EventsResponse;
};

/**
 * Get all events on a date.
 * @param date The date to get events for.
 * @param days The number of days to get events for (before given date).
 * @returns A promise that resolves with the events.
 */
export const searchByDate = async (
  date: Date, 
  days?: number
): Promise<EventsResponse> => {
  return await jreq(`${API}/event?date=${date.toISOString()}${days ? '&days='+days : ''}`, {
    method: 'GET',
  }) as EventsResponse;
};

/**
 * Update an event.
 * @param id The ID of the event to update.
 * @param name The name of the event.
 * @param desc The description of the event.
 * @param date The date of the event.
 * @param location The location of the event.
 * @returns A promise that resolves with the event.
 */
export const update = async (
  id: number, 
  name: string, 
  desc: string, 
  date?: Date|null, 
  location?: number
): Promise<EventResponse> => {
  return await jreq(`${API}/event/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, desc, date, location }),
    credentials: 'include',
  }) as EventResponse;
};

/**
 * Remove an event.
 * @param id The ID of the event to remove.
 * @returns A promise that resolves with the event.
 */
export const remove = async (id: number): Promise<APIResponse> => {
  return await jreq(`${API}/event/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Get all participants for an event.
 * @param id The ID of the event to get participants for.
 * @returns A promise that resolves with the participants.
 */
export const participants = async (id: number): Promise<ParticipantsResponse> => {
  return await jreq(`${API}/event/${id}/participants`, {
    method: 'GET',
  }) as ParticipantsResponse;
};
