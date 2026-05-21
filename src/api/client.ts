import type { ApiMessage } from '../types';

export const API_BASE_URL =
  'https://o6duby7xvh.execute-api.us-east-1.amazonaws.com/prod';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text } as T;
  }
}

function extractErrorMessage(data: ApiMessage | undefined, fallback: string): string {
  if (!data) return fallback;
  return data.message || data.error || fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  const data = await parseBody<ApiMessage & T>(response);

  if (!response.ok) {
    const message = extractErrorMessage(
      data,
      `Error ${response.status}: ${response.statusText}`,
    );
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!response.ok) {
    throw new ApiError(
      `No se pudo subir la imagen a S3 (${response.status})`,
      response.status,
    );
  }
}
