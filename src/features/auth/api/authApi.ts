import { apiClient } from '@/core/api/client';
import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  AuthProfileResponse,
} from '../types/auth';

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', payload);
  },

  async getMe(): Promise<AuthProfileResponse> {
    return apiClient.get<AuthProfileResponse>('/auth/me');
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    return apiClient.put<void>('/auth/change-password', payload);
  },
};
