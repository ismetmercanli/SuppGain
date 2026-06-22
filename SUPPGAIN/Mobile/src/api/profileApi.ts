import { apiClient } from './client';
import type { UpdateProfileRequest, UserProfile } from '../types/profile';

export async function getMyProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}

export async function updateMyProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>('/users/me', payload);
  return response.data;
}

export async function deleteMyProfile(): Promise<void> {
  await apiClient.delete('/users/me');
}

