import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { UpdateProfileRequest, UserProfile } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const profileApi = axios.create({
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

export async function getMyProfile(token: string): Promise<UserProfile> {
  const response = await profileApi.get<UserProfile>('/users/me', withAuth(token))
  return response.data
}

export async function updateMyProfile(
  token: string,
  payload: UpdateProfileRequest,
): Promise<UserProfile> {
  const response = await profileApi.put<UserProfile>('/users/me', payload, withAuth(token))
  return response.data
}

export async function deleteMyProfile(token: string): Promise<void> {
  await profileApi.delete('/users/me', withAuth(token))
}

export { getApiErrorMessage }
