import type { PaymentMethod } from '@/core/types/common';

export interface CreatePaymentRequest {
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface PaymentRecord {
  id: number;
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
  notes: string | null;
  paid_at: string;
  created_at: string;
}
