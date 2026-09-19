import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  ReceiptText,
  Percent,
  Package,
} from 'lucide-react';
import { reportsApi } from '../api/reportsApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { toast } from '@/components/feedback/toastStore';
import { formatRupiah } from '@/utils/currency';
import type { OrderType, OrderStatus } from '@/core/types/common';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'profit'>('sales');

  // Default date filter: First day of current month to today
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const today = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(today);
  const [orderType, setOrderType] = useState<OrderType | ''>('');
  const [isExporting, setIsExporting] = useState(false);

  // Set preset ranges
  const handleSetPreset = (type: 'today' | 'last7' | 'thisMonth' | 'lastMonth') => {
    const d = new Date();
    if (type === 'today') {
      const todayStr = d.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'last7') {
      const endStr = d.toISOString().split('T')[0];
      d.setDate(d.getDate() - 6);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(endStr);
    } else if (type === 'thisMonth') {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const endStr = new Date().toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(endStr);
    } else if (type === 'lastMonth') {
      const firstDayLastMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDayLastMonth = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(firstDayLastMonth);
      setEndDate(lastDayLastMonth);
    }
  };

  // Queries
  const {
    data: salesData,
    isLoading: isSalesLoading,
  } = useQuery({
    queryKey: ['sales-report', startDate, endDate, orderType],
    queryFn: () =>
      reportsApi.getSalesReport({
        start_date: startDate,
        end_date: endDate,
        order_type: orderType,
      }),
    enabled: activeTab === 'sales' && Boolean(startDate && endDate),
  });

  const {
    data: profitData,
    isLoading: isProfitLoading,
  } = useQuery({
    queryKey: ['profit-report', startDate, endDate, orderType],
    queryFn: () =>
      reportsApi.getProfitReport({
        start_date: startDate,
        end_date: endDate,
        order_type: orderType,
      }),
    enabled: activeTab === 'profit' && Boolean(startDate && endDate),
  });

  const handleExportCSV = async () => {
    if (!startDate || !endDate) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setIsExporting(true);
    try {
      await reportsApi.exportCSV({
        start_date: startDate,
        end_date: endDate,
        order_type: orderType,
        type: activeTab,
      });
      toast.success(`Ekspor CSV Laporan ${activeTab === 'sales' ? 'Penjualan' : 'Laba'} berhasil diunduh`);
    } catch {
      toast.error('Gagal mengunduh file ekspor CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-700" />
            Laporan Keuangan & Laba Kotor
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Analisis performa omset, margin kotor toko, dan ekspor data CSV akuntansi.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleExportCSV}
          isLoading={isExporting}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Ekspor CSV ({activeTab === 'sales' ? 'Penjualan' : 'Laba Kotor'})
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'sales'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Laporan Penjualan (Sales)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profit')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'profit'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Analisis Laba Kotor (Gross Profit)
        </button>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-4 bg-stone-50 border-stone-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-bold text-stone-700">Periode:</span>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
            />
            <span className="text-xs text-stone-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
              <button
                type="button"
                onClick={() => handleSetPreset('today')}
                className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('last7')}
                className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('thisMonth')}
                className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('lastMonth')}
                className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
              >
                Bulan Lalu
              </button>
            </div>
          </div>

          {/* Order Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">Tipe Transaksi:</span>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType | '')}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            >
              <option value="">Semua Tipe</option>
              <option value="DIRECT_SALE">Direct Sale (Penjualan Langsung)</option>
              <option value="PRE_ORDER">Pre-Order (PO)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tab 1: Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Transaksi
                </span>
                <ReceiptText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-900 mt-2">
                {isSalesLoading ? '...' : salesData?.total_transactions || 0}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Transaksi pada periode ini</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Pendapatan
                </span>
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-900 mt-2">
                {isSalesLoading ? '...' : formatRupiah(salesData?.total_revenue || 0)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Omset bruto pesanan</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Rata-rata Transaksi (AOV)
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-2">
                {isSalesLoading
                  ? '...'
                  : formatRupiah(
                      salesData?.total_transactions
                        ? salesData.total_revenue / salesData.total_transactions
                        : 0
                    )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Nilai per struk belanja</p>
            </Card>
          </div>

          {/* Sales Table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm">
                Rincian Transaksi Penjualan ({salesData?.items?.length || 0})
              </h3>
            </div>

            {isSalesLoading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner text="Memuat laporan penjualan..." />
              </div>
            ) : !salesData?.items || salesData.items.length === 0 ? (
              <EmptyState
                icon={<ReceiptText className="w-7 h-7" />}
                title="Tidak Ada Data Penjualan"
                description="Tidak ada transaksi pada filter periode ini."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Transaksi</TableHead>
                    <TableHead className="text-right">Total Terbayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.items.map((item) => (
                    <TableRow key={item.invoice_no}>
                      <TableCell className="font-mono text-xs font-bold text-amber-900">
                        {item.invoice_no}
                      </TableCell>
                      <TableCell className="text-xs text-stone-600 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-stone-800">
                        {item.customer_name || 'Walk-in'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
                          {item.order_type === 'PRE_ORDER' ? 'PO' : 'Direct'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={item.status as OrderStatus} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-stone-900">
                        {formatRupiah(item.total_amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium text-emerald-700">
                        {formatRupiah(item.total_paid)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Profit Report */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Pendapatan
                </span>
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-900 mt-2">
                {isProfitLoading ? '...' : formatRupiah(profitData?.total_revenue || 0)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Omset bruto penjualan</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total HPP Modal
                </span>
                <Package className="w-5 h-5 text-stone-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-800 mt-2">
                {isProfitLoading ? '...' : formatRupiah(profitData?.total_hpp || 0)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Harga pokok produksi barang</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Laba Kotor
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-2">
                {isProfitLoading ? '...' : formatRupiah(profitData?.total_gross_profit || 0)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Omset dikurangi HPP modal</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Rata-rata Margin
                </span>
                <Percent className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-indigo-900 mt-2">
                {isProfitLoading
                  ? '...'
                  : `${(profitData?.average_margin_pct || 0).toFixed(1)}%`}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Persentase laba kotor</p>
            </Card>
          </div>

          {/* Daily Profit Breakdown Table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm">
                Rincian Margin & Laba Kotor Harian
              </h3>
            </div>

            {isProfitLoading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner text="Menganalisis data laba kotor..." />
              </div>
            ) : !profitData?.daily_breakdown || profitData.daily_breakdown.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="w-7 h-7" />}
                title="Tidak Ada Data Laba"
                description="Tidak ada data pada periode dan filter ini."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Pendapatan (Omset)</TableHead>
                    <TableHead className="text-right">Total HPP</TableHead>
                    <TableHead className="text-right">Laba Kotor</TableHead>
                    <TableHead className="text-right">Margin (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitData.daily_breakdown.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-mono text-xs font-semibold text-stone-900">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium text-stone-900">
                        {formatRupiah(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-stone-500">
                        {formatRupiah(row.total_hpp)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-800">
                        {formatRupiah(row.gross_profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            row.margin_pct >= 40
                              ? 'bg-emerald-50 text-emerald-700'
                              : row.margin_pct >= 20
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.margin_pct.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
