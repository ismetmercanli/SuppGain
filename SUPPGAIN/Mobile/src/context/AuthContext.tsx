import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getCurrentSession,
  loginAndSaveSession,
  registerAndSaveSession,
  signOut as clearSession,
} from '../api/authGroupApi';
import { registerUnauthorizedHandler } from '../api/client';
import type {
  AuthSession,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

type AuthContextValue = {
  session: AuthSession | null;
  isBootstrapping: boolean;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((storedSession) => {
        if (isMounted) {
          setSession(storedSession);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (payload: LoginRequest) => {
    const nextSession = await loginAndSaveSession(payload);
    setSession(nextSession);
  }, []);

  const signUp = useCallback(async (payload: RegisterRequest) => {
    const nextSession = await registerAndSaveSession(payload);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  /* JWT süresi dolunca otomatik logout */
  useEffect(() => {
    registerUnauthorizedHandler(() => { void signOut(); });
  }, [signOut]);

  const value = useMemo(
    () => ({
      session,
      isBootstrapping,
      signIn,
      signUp,
      signOut,
    }),
    [isBootstrapping, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
