import type { UserRole, UserSummary } from '@/core/types/common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserSummary;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthProfileResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
