import axios from 'axios';

import { API_BASE_URL } from './config';
import { getStoredToken } from '../storage/tokenStorage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/* ── Request interceptor: JWT token ── */
apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── 401 handler (AuthContext tarafından kaydedilir) ── */
let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  _onUnauthorized = handler;
}

/* ── Response interceptor: 401 → otomatik logout ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      _onUnauthorized
    ) {
      _onUnauthorized();
    }
    return Promise.reject(error);
  },
);
