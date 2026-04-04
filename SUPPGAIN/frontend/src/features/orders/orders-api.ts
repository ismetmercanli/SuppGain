import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { Order } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const ordersApi = axios.create({
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

export async function createOrder(token: string): Promise<Order> {
  const response = await ordersApi.post<Order>('/orders', {}, withAuth(token))
  return response.data
}

export async function getOrderById(token: string, orderId: string): Promise<Order> {
  const response = await ordersApi.get<Order>(`/orders/${orderId}`, withAuth(token))
  return response.data
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const response = await ordersApi.get<Order[]>('/orders/me', withAuth(token))
  return response.data
}

export { getApiErrorMessage }
