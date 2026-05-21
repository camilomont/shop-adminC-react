import { apiRequest } from './client';
import type { ListResponse, User } from '../types';

const LIMIT = 25;

export async function listUsers(): Promise<User[]> {
  const data = await apiRequest<ListResponse<User>>(`/users?limit=${LIMIT}`);
  return data.items ?? [];
}

export async function createUser(payload: User): Promise<User> {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  userId: string,
  payload: Pick<User, 'name' | 'email'>,
): Promise<User> {
  return apiRequest<User>(`/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
