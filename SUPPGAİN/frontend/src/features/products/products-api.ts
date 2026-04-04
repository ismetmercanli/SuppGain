import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { Product, ProductQuery, SaveProductRequest } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const productsApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function withAuth(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export async function getProducts(query: ProductQuery): Promise<Product[]> {
  const response = await productsApi.get<Product[]>('/products', { params: query })
  return response.data
}

export async function createProduct(token: string, payload: SaveProductRequest): Promise<Product> {
  const response = await productsApi.post<Product>('/products', payload, withAuth(token))
  return response.data
}

export async function updateProduct(
  token: string,
  productId: string,
  payload: SaveProductRequest,
): Promise<Product> {
  const response = await productsApi.put<Product>(`/products/${productId}`, payload, withAuth(token))
  return response.data
}

export async function deleteProduct(token: string, productId: string): Promise<void> {
  await productsApi.delete(`/products/${productId}`, withAuth(token))
}

export { getApiErrorMessage }
