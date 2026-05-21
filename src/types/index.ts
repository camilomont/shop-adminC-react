export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface Product {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface Purchase {
  userId: string;
  productId: string;
  quantity: number;
  purchaseDate?: string;
}

export interface ListResponse<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, string> | null;
}

export interface ApiMessage {
  message?: string;
  error?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  objectKey: string;
}

export interface UserFormValues {
  userId: string;
  name: string;
  email: string;
}

export interface ProductFormValues {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
}

export interface OrderFormValues {
  userId: string;
  productId: string;
  quantity: string;
}

export type AlertType = 'success' | 'error' | null;

export interface AlertState {
  type: AlertType;
  message: string;
}
