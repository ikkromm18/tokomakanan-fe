import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/core/types/api';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
} from '../types/users';

export const usersApi = {
  async list(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return apiClient.getPaginated<User>('/users', { params });
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async create(payload: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', payload);
  },

  async update(id: number, payload: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, payload);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
