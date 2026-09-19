import type { Order } from '@/features/orders/types/order';

export interface DashboardSummary {
  today_revenue: number;
  today_transactions: number;
  active_pre_orders: number;
  today_gross_profit?: number | null;
}

export interface SalesChartPoint {
  date: string;
  total_sales: number;
  total_orders: number;
}

export interface DashboardChartParams {
  start_date?: string;
  end_date?: string;
}

export type POReminderOrder = Order;
