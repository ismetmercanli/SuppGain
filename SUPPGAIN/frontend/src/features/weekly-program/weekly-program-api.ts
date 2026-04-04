import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { WeeklyAutoCreateRequest, WeeklyProgram } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const weeklyApi = axios.create({
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

export async function getMyWeeklyPrograms(token: string): Promise<WeeklyProgram[]> {
  const response = await weeklyApi.get<WeeklyProgram[]>('/weekly-program/me', withAuth(token))
  return response.data
}

export async function createWeeklyProgram(
  token: string,
  payload: { title: string; contentJson: string },
): Promise<WeeklyProgram> {
  const response = await weeklyApi.post<WeeklyProgram>('/weekly-program', payload, withAuth(token))
  return response.data
}

export async function autoCreateWeeklyProgram(
  token: string,
  payload: WeeklyAutoCreateRequest,
): Promise<WeeklyProgram> {
  const response = await weeklyApi.post<WeeklyProgram>(
    '/weekly-program/auto-from-purchases',
    payload,
    withAuth(token),
  )
  return response.data
}

export async function updateWeeklyProgram(
  token: string,
  programId: string,
  payload: { title: string; contentJson: string },
): Promise<WeeklyProgram> {
  const response = await weeklyApi.put<WeeklyProgram>(
    `/weekly-program/${programId}`,
    payload,
    withAuth(token),
  )
  return response.data
}

export async function deleteWeeklyProgram(token: string, programId: string): Promise<void> {
  await weeklyApi.delete(`/weekly-program/${programId}`, withAuth(token))
}

export { getApiErrorMessage }
