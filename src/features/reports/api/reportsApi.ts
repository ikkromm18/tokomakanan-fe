import { apiClient, axiosInstance } from '@/core/api/client';
import type {
  ReportFilterParams,
  SalesReportResponse,
  ProfitReportResponse,
} from '../types/reports';

export const reportsApi = {
  async getSalesReport(params: ReportFilterParams): Promise<SalesReportResponse> {
    return apiClient.get<SalesReportResponse>('/reports/sales', { params });
  },

  async getProfitReport(params: ReportFilterParams): Promise<ProfitReportResponse> {
    return apiClient.get<ProfitReportResponse>('/reports/profit', { params });
  },

  async exportCSV(params: ReportFilterParams): Promise<void> {
    const response = await axiosInstance.get('/reports/export', {
      params,
      responseType: 'blob',
    });

    // Try to read filename from content-disposition header
    let filename = `laporan_${params.type || 'sales'}_${params.start_date}_sd_${params.end_date}.csv`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
