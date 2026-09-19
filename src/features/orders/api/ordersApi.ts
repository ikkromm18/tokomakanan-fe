import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/core/types/api';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderQueryParams,
} from '../types/order';

export const ordersApi = {
  async list(params?: OrderQueryParams): Promise<PaginatedResponse<Order>> {
    return apiClient.getPaginated<Order>('/orders', { params });
  },

  async getById(id: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async create(payload: CreateOrderRequest): Promise<Order> {
    return apiClient.post<Order>('/orders', payload);
  },

  async updateStatus(id: number, payload: UpdateOrderStatusRequest): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${id}/status`, payload);
  },
};
