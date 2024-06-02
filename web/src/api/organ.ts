import { API, jreq } from './index';
import type { APIResponse } from './index';
import type { Person } from './person';
import type { Organization } from './organization';
import type { Role } from './role';

/**
 * Represents an organ.
 */
export interface Organ {
  /**
   * The ID of the organ. This is unique across all organs.
   */
  id: number;
  /**
   * The biography of the organ. This is a markdown string.
   */
  bio: string;
}

/**
 * Represents a social media account for an organ.
 */
export interface OrganSocials {
  /**
   * The ID of the social media account. This is unique across all accounts.
   */
  id: number;
  /**
   * The platform of the account.
   */
  platform: number;
  /**
   * The URL of the account.
   */
  url: string;
}

/**
 * Represents a source for an organ.
 */
export interface OrganSource {
  /**
   * The ID of the source. This is unique across all sources.
   */
  sid: number;
  /**
   * The URL of the source.
   */
  url: string;
}

export interface AbstractMembership {
  /**
   * The ID of the membership. This is unique across all memberships.
   */
  id: number;
  /**
   * The role that the person has in the organization.
   */
  role: Role;
  /**
   * The date that the person became a member of the organization.
   */
  since?: Date|null;
  /**
   * The date that the person stopped being a member of the organization.
   */
  until?: Date|null;
}

/**
 * Represents a membership of a specific organ in an organization.
 */
export interface OrganMembership extends AbstractMembership {
  /**
   * The organization that the organ is a member of.
   */
  organization: Organization;
}

export interface OrganizationMember extends AbstractMembership {
  /**
   * The organ that is a member of the organization.
   */
  organ: Organ;
}

/**
 * Represents a membership of an organ in an organization.
 * A membership is identified by its `organ`, `organization`,
 * `role` and `since` fields.
 */
export interface Membership extends OrganMembership {
  /**
   * The organ that is a member of the organization.
   */
  organ: Organ;
}

/**
 * Represents a source for a membership.
 */
export interface MembershipSource {
  /**
   * The ID of the source. This is unique across all sources.
   */
  sid: number;
  /**
   * The URL of the source.
   */
  url: string;
}

/**
 * Represents the response from the API containing an organ.
 */
export interface OrganResponse extends APIResponse {
  organ?: Organ;
}

/**
 * Represents the response from the API containing multiple organs
 * - i.e. `people` and `organizations`.
 */
export interface OrgansResponse extends APIResponse {
  /**
   * The people that match the query.
   */
  people: Person[];
  /**
   * The organizations that match the query.
   */
  organizations: Organization[];
}

/**
 * Represents the response from the API containing multiple sources
 * for an organ.
 */
export interface OrganSourcesResponse extends APIResponse {
  sources?: OrganSource[];
}

/**
 * Represents the response from the API containing a source for an organ.
 */
export interface OrganSourceResponse extends APIResponse {
  source?: OrganSource;
}

/**
 * Represents the response from the API containing multiple social media accounts
 */
export interface OrganSocialsResponse extends APIResponse {
  socials: OrganSocials[];
}

/**
 * Represents the response from the API containing a social media account.
 */
export interface OrganSocialsSingleResponse extends APIResponse {
  social?: OrganSocials;
}

/**
 * Represents the response from the API containing multiple memberships
 */
export interface OrganMembershipsResponse extends APIResponse {
  memberships: OrganMembership[];
}

/**
 * Represents the response from the API containing a membership.
 */
export interface MembershipResponse extends APIResponse {
  membership?: Membership;
}

/**
 * Represents the response from the API containing a bio picture.
 */
export interface BioPicResponse extends APIResponse {
  url?: string;
}

/**
 * Creates a new organ.
 * @param bio The biography of the organ.
 * @returns A promise that resolves to the response containing the new organ.
 */
export const create = async (bio: string): Promise<OrganResponse> => {
  return await jreq(`${API}/organ/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio }),
    credentials: 'include',
  }) as OrganResponse;
};

/**
 * Gets an organ by its ID.
 * @param oid The ID of the organ to get.
 * @returns A promise that resolves to the organ with the given ID, or null if no such organ exists.
 */
export const get = async (oid: number): Promise<OrganResponse> => {
  return await jreq(`${API}/organ/${oid}`) as OrganResponse;
};

/**
 * Searches for organs by their names.
 * @param query The query to search for.
 * @returns A promise that resolves to the response containing the organs that match the query.
 */
export const search = async (query: string): Promise<OrgansResponse> => {
  return await jreq(`${API}/organ?q=${query}`) as OrgansResponse;
};

/**
 * Uploads a picture for the bio of an organ.
 * @param oid The ID of the organ to upload the picture for.
 * @param pic The picture to upload.
 * @returns A promise that resolves to the response from the API.
 * @deprecated Use the `media` API instead.
 */
export const uploadBioPic = async (oid: number, pic: Blob): Promise<BioPicResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/organ/${oid}/biopic`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  }) as BioPicResponse;
};

/**
 * Gets an organ's picture.
 * @param oid The ID of the organ to get the picture of.
 * @returns A promise that resolves to the picture of the organ.
 */
export const pic = async (oid: number): Promise<Blob> => {
  return await fetch(`${API}/organ/${oid}/pic`).then(res => res.blob());
};

/**
 * Sets an organ's picture.
 * @param oid The ID of the organ to set the picture of.
 * @param pic The picture to set.
 * @returns A promise that resolves to the response from the API.
 */
pic.set = async (oid: number, pic: Blob): Promise<APIResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/organ/${oid}/pic`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });
};

/**
 * Removes an organ's picture.
 * @param oid The ID of the organ to remove the picture of.
 * @returns A promise that resolves to the response from the API.
 */
pic.remove = async (oid: number): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/pic`, {
    method: 'DELETE',
    credentials: 'include',
  });
};

/**
 * Gets an organ's social media accounts.
 * @param oid The ID of the organ to get the social media accounts of.
 * @returns A promise that resolves to the response containing the social media accounts.
 */
export const socials = async (oid: number): Promise<OrganSocialsResponse> => {
  return await jreq(`${API}/organ/${oid}/socials`) as OrganSocialsResponse;
}

/**
 * Adds a social media account to an organ.
 * @param oid The ID of the organ to add the social media account to.
 * @param platform The platform of the account.
 * @param url The URL of the account.
 * @returns A promise that resolves to the response containing the new social media account.
 */
socials.add = async (oid: number, platform: number, url: string): Promise<OrganSocialsSingleResponse> => {
  return await jreq(`${API}/organ/${oid}/socials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, url }),
    credentials: 'include',
  }) as OrganSocialsSingleResponse;
};

/**
 * Updates a social media account for an organ.
 * @param oid The ID of the organ that the account belongs to.
 * @param sid The ID of the account to update.
 * @param platform The new platform of the account.
 * @param url The new URL of the account.
 * @returns A promise that resolves to the response from the API.
 */
socials.update = async (oid: number, sid: number, platform: number, url: string): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/socials/${sid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, url }),
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Removes a social media account from an organ.
 * @param oid The ID of the organ that the account belongs to.
 * @param sid The ID of the account to remove.
 * @returns A promise that resolves to the response from the API.
 */
socials.remove = async (oid: number, sid: number): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/socials/${sid}`, {
    method: 'DELETE',
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Gets an organ's sources.
 * @param oid The ID of the organ to get the sources of.
 * @returns A promise that resolves to the response containing the sources.
 */
export const sources = async (oid: number): Promise<OrganSourcesResponse> => {
  return await jreq(`${API}/organ/${oid}/sources`) as OrganSourcesResponse;
};

/**
 * Adds a source to an organ.
 * @param oid The ID of the organ to add the source to.
 * @param url The URL of the source to add.
 * @returns A promise that resolves to the response containing the new source.
 */
sources.add = async (oid: number, url: string): Promise<OrganSourceResponse> => {
  return await jreq(`${API}/organ/${oid}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    credentials: 'include',
  }) as OrganSourceResponse;
};

/**
 * Updates a source for an organ.
 * @param oid The ID of the organ that the source belongs to.
 * @param sid The ID of the source to update.
 * @param url The new URL of the source.
 * @returns A promise that resolves to the response from the API.
 */
sources.update = async (oid: number, sid: number, url: string): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/sources/${sid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Removes a source from an organ.
 * @param oid The ID of the organ that the source belongs to.
 * @param sid The ID of the source to remove.
 * @returns A promise that resolves to the response from the API.
 */
sources.remove = async (oid: number, sid: number): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${oid}/sources/${sid}`, {
    method: 'DELETE',
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Gets an organ's memberships.
 * @param oid The ID of the organ to get the memberships of.
 * @returns A promise that resolves to the response containing the memberships.
 */
export const memberships = async (oid: number): Promise<OrganMembershipsResponse> => {
  const res = await jreq(`${API}/organ/${oid}/memberships`) as OrganMembershipsResponse;
  if (res.memberships) {
    res.memberships.forEach((m: OrganMembership) => {
      m.organization.established = m.organization.established ? new Date(m.organization.established) : undefined;
      m.organization.dissolved = m.organization.dissolved ? new Date(m.organization.dissolved) : undefined;
      m.since = m.since ? new Date(m.since) : undefined;
      m.until = m.until ? new Date(m.until) : undefined;
    });
  }
  return res;
};

/**
 * Adds a membership to an organ.
 * @param sources The sources for the membership.
 * @param organ The organ to add the membership to.
 * @param organization The organization that the organ is a member of.
 * @param role The role that the organ has in the organization.
 * @param since The date that the organ became a member of the organization.
 * @param until The date that the organ stopped being a member of the organization.
 * @returns A promise that resolves to the response containing the new membership.
 */
memberships.add = async (
  sources: string[],
  organ: Organ, 
  organization: Organization, 
  role: Role, 
  since?: Date|null, 
  until?: Date|null
): Promise<MembershipResponse> => {
  return await jreq(`${API}/organ/${organ.id}/memberships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      sources,
      organization: organization.id, 
      role: role.id, 
      since, 
      until, 
    }),
    credentials: 'include',
  }) as MembershipResponse;
};

/**
 * Updates a membership of an organ in an organization.
 */
memberships.update = async (
  organ: Organ,
  mid: number,
  role?: Role,
  since?: Date|null,
  until?: Date|null
): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${organ.id}/memberships/${mid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: role?.id,
      since,
      until,
    }),
    credentials: 'include',
  }) as APIResponse;
};

/**
 * Remove a membership.
 */
memberships.remove = async (
  organ: Organ,
  mid: number
): Promise<APIResponse> => {
  return await jreq(`${API}/organ/${organ.id}/memberships/${mid}`, {
    method: 'DELETE',
    credentials: 'include',
  }) as APIResponse;
};

memberships.sources = async (organ: Organ, mid: number): Promise<OrganSourcesResponse> => {
  return await jreq(`${API}/organ/${organ.id}/memberships/${mid}/sources`) as OrganSourcesResponse;
};
