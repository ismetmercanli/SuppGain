import { login, register } from './authApi';
import {
  clearStoredSession,
  getStoredSession,
  saveSession,
} from '../storage/tokenStorage';
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth';

export async function registerAndSaveSession(payload: RegisterRequest): Promise<AuthSession> {
  const session = await register(payload);
  await saveSession(session);
  return session;
}

export async function loginAndSaveSession(payload: LoginRequest): Promise<AuthSession> {
  const session = await login(payload);
  await saveSession(session);
  return session;
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  return getStoredSession();
}

export async function signOut(): Promise<void> {
  await clearStoredSession();
}

