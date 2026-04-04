import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { PATHS } from '../router/paths'

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={PATHS.DASHBOARD} replace />
  }

  return <>{children}</>
}
