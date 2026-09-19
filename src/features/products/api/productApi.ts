import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/core/types/api';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from '../types/product';

export const productApi = {
  async list(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    return apiClient.getPaginated<Product>('/products', { params });
  },

  async getById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async create(payload: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>('/products', payload);
  },

  async update(id: number, payload: UpdateProductRequest): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, payload);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/products/${id}`);
  },
};
