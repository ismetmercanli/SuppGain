import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { clearSession, readSession, writeSession } from './auth-storage'
import type { AuthSession } from './types'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession | null>(() => readSession())

  const setSession = useCallback((nextSession: AuthSession) => {
    writeSession(nextSession)
    setSessionState(nextSession)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSessionState(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: Boolean(session?.token),
    setSession,
    signOut,
  }), [session, setSession, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.')
  }
  return context
}
