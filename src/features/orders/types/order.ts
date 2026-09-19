import type { OrderType, OrderStatus, PaymentMethod, ItemType } from '@/core/types/common';
import type { BaseQueryParams } from '@/core/types/api';

export interface OrderItem {
  id: number;
  item_type: ItemType;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  unit_hpp?: number | null; // null for admin
  subtotal: number;
}

export interface OrderPayment {
  id: number;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string | null;
  paid_at: string;
  created_at?: string;
}

export interface Order {
  id: number;
  invoice_no: string;
  invoice_token: string;
  customer_id: number | null;
  customer_name?: string | null;
  user_id: number;
  user_name?: string;
  order_type: OrderType;
  status: OrderStatus;
  pickup_date: string | null;
  notes: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  total_hpp?: number | null; // null for admin
  total_paid: number;
  remaining_paid?: number;
  payment_method: PaymentMethod;
  items: OrderItem[];
  payments: OrderPayment[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderItemInput {
  item_type: ItemType;
  item_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customer_id: number | null;
  order_type: OrderType;
  pickup_date: string | null;
  notes?: string | null;
  discount_amount?: number;
  payment_method: PaymentMethod;
  initial_paid: number;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderQueryParams extends BaseQueryParams {
  order_type?: OrderType | '';
  status?: OrderStatus | '';
  start_date?: string;
  end_date?: string;
}
