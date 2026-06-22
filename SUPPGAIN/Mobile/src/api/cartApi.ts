import { apiClient } from './client';
import type { AddToCartRequest, Cart } from '../types/cart';

export async function addToCart(payload: AddToCartRequest): Promise<Cart> {
  const response = await apiClient.post<Cart>('/cart', payload);
  return response.data;
}

export async function getMyCart(): Promise<Cart> {
  const response = await apiClient.get<Cart>('/cart');
  return response.data;
}

