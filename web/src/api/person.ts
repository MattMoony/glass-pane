import { API, jreq } from './index';
import type { Organ } from './organ';
import type { APIResponse } from './index';

export interface Person extends Organ {
  id: number;
  firstname: string;
  lastname: string;
  birthdate?: Date;
  deathdate?: Date;
}

export interface Relation {
  from: Person;
  to: Person;
  since: Date;
  until?: Date;
}

export interface RelationSource {
  sid: number;
  url: string;
}

export interface PersonResponse extends APIResponse {
  person?: Person;
}

export interface NewPersonResponse extends PersonResponse {
}

export const create = async (
  firstname: string, 
  lastname: string, 
  bio: string,
  birthdate?: Date,
  deathdate?: Date
): Promise<NewPersonResponse> => {
  return await jreq(`${API}/person/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, bio, birthdate, deathdate, }),
  }) as NewPersonResponse;
}

export const get = async (pid: number): Promise<PersonResponse> => {
  return await jreq(`${API}/person/${pid}`) as PersonResponse;
}

export const pic = async (pid: number): Promise<Blob> => {
  return await fetch(`${API}/person/${pid}/pic`).then(res => res.blob());
}

pic.set = async (pid: number, pic: Blob): Promise<APIResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/person/${pid}/pic`, {
    method: 'POST',
    body: formData,
  });
}

pic.remove = async (pid: number): Promise<APIResponse> => {
  return await jreq(`${API}/person/${pid}/pic`, {
    method: 'DELETE',
  });
}
