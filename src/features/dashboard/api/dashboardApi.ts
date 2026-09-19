import { apiClient } from '@/core/api/client';
import type {
  DashboardSummary,
  SalesChartPoint,
  DashboardChartParams,
  POReminderOrder,
} from '../types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/dashboard/summary');
  },

  async getChart(params?: DashboardChartParams): Promise<SalesChartPoint[]> {
    return apiClient.get<SalesChartPoint[]>('/dashboard/chart', { params });
  },

  async getPOReminders(): Promise<POReminderOrder[]> {
    return apiClient.get<POReminderOrder[]>('/dashboard/po-reminders');
  },
};
