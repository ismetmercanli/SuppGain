import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { AddToCartRequest, Cart } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const cartApi = axios.create({
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

export async function addToCart(token: string, payload: AddToCartRequest): Promise<Cart> {
  const response = await cartApi.post<Cart>('/cart', payload, withAuth(token))
  return response.data
}

export async function getMyCart(token: string): Promise<Cart> {
  const response = await cartApi.get<Cart>('/cart', withAuth(token))
  return response.data
}

export { getApiErrorMessage }
