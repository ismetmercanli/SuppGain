export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  age?: number | null
  gender?: string | null
  heightCm?: number | null
  weightKg?: number | null
  isActive?: boolean
  role: string
}

export interface AuthSession {
  token: string
  expiresAtUtc: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}
