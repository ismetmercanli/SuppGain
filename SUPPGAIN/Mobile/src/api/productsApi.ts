import { apiClient } from './client';
import type { Product, ProductQuery, SaveProductRequest } from '../types/product';

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const response = await apiClient.get<Product[]>('/products', {
    params: query,
  });

  return response.data;
}

export async function createProduct(payload: SaveProductRequest): Promise<Product> {
  const response = await apiClient.post<Product>('/products', payload);
  return response.data;
}

export async function updateProduct(
  productId: string,
  payload: SaveProductRequest,
): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}

