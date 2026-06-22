import { apiClient } from './client';
import type {
  SaveWeeklyProgramRequest,
  WeeklyAutoCreateRequest,
  WeeklyProgram,
} from '../types/weeklyProgram';

export async function getMyWeeklyPrograms(): Promise<WeeklyProgram[]> {
  const response = await apiClient.get<WeeklyProgram[]>('/weekly-program/me');
  return response.data;
}

export async function createWeeklyProgram(
  payload: SaveWeeklyProgramRequest,
): Promise<WeeklyProgram> {
  const response = await apiClient.post<WeeklyProgram>('/weekly-program', payload);
  return response.data;
}

export async function autoCreateWeeklyProgram(
  payload: WeeklyAutoCreateRequest,
): Promise<WeeklyProgram> {
  const response = await apiClient.post<WeeklyProgram>(
    '/weekly-program/auto-from-purchases',
    payload,
  );
  return response.data;
}

export async function updateWeeklyProgram(
  programId: string,
  payload: SaveWeeklyProgramRequest,
): Promise<WeeklyProgram> {
  const response = await apiClient.put<WeeklyProgram>(
    `/weekly-program/${programId}`,
    payload,
  );
  return response.data;
}

export async function deleteWeeklyProgram(programId: string): Promise<void> {
  await apiClient.delete(`/weekly-program/${programId}`);
}

