import { apiClient } from '@/core/api/client';
import type { PublicInvoiceResponse } from '../types/publicInvoice';

export const publicInvoiceApi = {
  async getByToken(token: string): Promise<PublicInvoiceResponse> {
    return apiClient.get<PublicInvoiceResponse>(`/public/invoice/${token}`);
  },
};
