import { apiClient } from './client';
import type { Order } from '../types/order';

export async function createOrder(): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', {});
  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders/me');
  return response.data;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
}

