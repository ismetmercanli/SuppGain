import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '../types/auth';

const SESSION_KEY = 'suppgain.mobile.auth.session';

export async function getStoredSession(): Promise<AuthSession | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as AuthSession;
    if (!parsed.token || !parsed.user || !parsed.expiresAtUtc) {
      await clearStoredSession();
      return null;
    }

    return parsed;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function getStoredToken(): Promise<string | null> {
  const session = await getStoredSession();
  return session?.token ?? null;
}

export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

