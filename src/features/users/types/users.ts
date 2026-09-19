import type { UserRole } from '@/core/types/common';
import type { BaseQueryParams } from '@/core/types/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password?: string;
}

export interface UserQueryParams extends BaseQueryParams {
  role?: UserRole | '';
}
