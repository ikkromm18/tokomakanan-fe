import type { OrderType, OrderStatus } from '@/core/types/common';

export interface ReportFilterParams {
  start_date: string;
  end_date: string;
  order_type?: OrderType | '';
  type?: 'sales' | 'profit';
}

export interface SalesReportItem {
  invoice_no: string;
  date: string;
  customer_name?: string | null;
  order_type: OrderType;
  total_amount: number;
  total_paid: number;
  status: OrderStatus;
}

export interface SalesReportResponse {
  total_transactions: number;
  total_revenue: number;
  items: SalesReportItem[];
}

export interface ProfitReportItem {
  date: string;
  revenue: number;
  total_hpp: number;
  gross_profit: number;
  margin_pct: number;
}

export interface ProfitReportResponse {
  total_revenue: number;
  total_hpp: number;
  total_gross_profit: number;
  average_margin_pct: number;
  daily_breakdown: ProfitReportItem[];
}
