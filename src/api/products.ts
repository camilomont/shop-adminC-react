import { apiRequest, uploadToPresignedUrl } from './client';
import type { ListResponse, Product, UploadUrlResponse } from '../types';

const LIMIT = 25;

export async function listProducts(): Promise<Product[]> {
  const data = await apiRequest<ListResponse<Product>>(`/products?limit=${LIMIT}`);
  return data.items ?? [];
}

export async function createProduct(payload: Product): Promise<Product> {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  productId: string,
  payload: Pick<Product, 'name' | 'price' | 'imageUrl'>,
): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiRequest(`/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export async function getUploadUrl(
  fileName: string,
  contentType: string,
): Promise<UploadUrlResponse> {
  return apiRequest<UploadUrlResponse>('/products/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const { uploadUrl, imageUrl } = await getUploadUrl(file.name, file.type);
  await uploadToPresignedUrl(uploadUrl, file);
  return imageUrl;
}

/** Alternativa: multipart directo al crear producto */
export async function createProductWithImage(
  productId: string,
  name: string,
  price: number,
  image: File,
): Promise<Product> {
  const form = new FormData();
  form.append('productId', productId);
  form.append('name', name);
  form.append('price', String(price));
  form.append('image', image);
  return apiRequest<Product>('/products', { method: 'POST', body: form });
}
