import { apiClient } from './client';
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth';

export async function login(payload: LoginRequest): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>('/auth/register', payload);
  return response.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

