import { API, jreq } from './index';
import type { APIResponse } from './index';

/**
 * Response from the server after uploading a picture.
 */
export interface UploadedMediaResponse extends APIResponse {
  url?: string;
}

/**
 * Upload a picture to the server.
 * @param pic The picture to upload.
 * @returns The URL of the uploaded picture.
 */
export const upload = async (pic: File|Blob): Promise<UploadedMediaResponse> => {
  const formData = new FormData();
  formData.append('pic', pic);
  return await jreq(`${API}/media/`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  }) as UploadedMediaResponse;
};
