import type { OrderType, OrderStatus } from '@/core/types/common';

export interface PublicInvoiceStoreInfo {
  name: string;
  address?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  receipt_footer?: string | null;
}

export interface PublicInvoiceItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface PublicInvoicePayment {
  amount: number;
  payment_method: string;
  paid_at: string;
}

export interface PublicInvoiceResponse {
  store: PublicInvoiceStoreInfo;
  invoice_no: string;
  customer_name?: string | null;
  cashier_name: string;
  order_type: OrderType;
  status: OrderStatus;
  pickup_date?: string | null;
  notes?: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  total_paid: number;
  remaining_paid: number;
  items: PublicInvoiceItem[];
  payments: PublicInvoicePayment[];
  created_at: string;
}
