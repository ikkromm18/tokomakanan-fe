import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/core/types/api';
import type {
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageQueryParams,
} from '../types/package';

export const packageApi = {
  async list(params?: PackageQueryParams): Promise<PaginatedResponse<Package>> {
    return apiClient.getPaginated<Package>('/packages', { params });
  },

  async getById(id: number): Promise<Package> {
    return apiClient.get<Package>(`/packages/${id}`);
  },

  async create(payload: CreatePackageRequest): Promise<Package> {
    return apiClient.post<Package>('/packages', payload);
  },

  async update(id: number, payload: UpdatePackageRequest): Promise<Package> {
    return apiClient.put<Package>(`/packages/${id}`, payload);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/packages/${id}`);
  },
};
