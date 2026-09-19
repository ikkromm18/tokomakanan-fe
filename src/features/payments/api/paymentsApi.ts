import { apiClient } from '@/core/api/client';
import type { CreatePaymentRequest, PaymentRecord } from '../types/payment';

export const paymentsApi = {
  async addPayment(orderId: number, payload: CreatePaymentRequest): Promise<void> {
    return apiClient.post<void>(`/orders/${orderId}/payments`, payload);
  },

  async listByOrder(orderId: number): Promise<PaymentRecord[]> {
    return apiClient.get<PaymentRecord[]>(`/orders/${orderId}/payments`);
  },
};
