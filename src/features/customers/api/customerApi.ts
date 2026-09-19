import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/core/types/api';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
} from '../types/customer';

export const customerApi = {
  async list(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
    return apiClient.getPaginated<Customer>('/customers', { params });
  },

  async getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  async create(payload: CreateCustomerRequest): Promise<Customer> {
    return apiClient.post<Customer>('/customers', payload);
  },

  async update(id: number, payload: UpdateCustomerRequest): Promise<Customer> {
    return apiClient.put<Customer>(`/customers/${id}`, payload);
  },
};
