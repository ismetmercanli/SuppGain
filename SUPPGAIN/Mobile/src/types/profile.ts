export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  isActive: boolean;
  role: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
}

