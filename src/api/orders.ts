import { apiRequest } from './client';
import type { ListResponse, Purchase, User } from '../types';

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
}

export async function listOrders(userId: string): Promise<Purchase[]> {
  const data = await apiRequest<ListResponse<Purchase>>(
    `/users/${encodeURIComponent(userId)}/products`,
  );
  return (data.items ?? []).map((item) => ({
    ...item,
    userId: item.userId ?? userId,
  }));
}

export async function listAllOrders(users: User[]): Promise<Purchase[]> {
  if (users.length === 0) return [];

  const batches = await Promise.all(
    users.map(async (user) => {
      try {
        return await listOrders(user.userId);
      } catch {
        return [] as Purchase[];
      }
    }),
  );

  return batches
    .flat()
    .sort((a, b) => {
      const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
      const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
      return dateB - dateA;
    });
}

export async function createOrder(
  userId: string,
  payload: CreateOrderPayload,
): Promise<Purchase> {
  return apiRequest<Purchase>(
    `/users/${encodeURIComponent(userId)}/products`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}
