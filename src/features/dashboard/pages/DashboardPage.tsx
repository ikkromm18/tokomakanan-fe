import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Store,
  RefreshCw,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { SalesBarChart } from '../components/SalesBarChart';
import { POReminderWidget } from '../components/POReminderWidget';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/utils/currency';
import { useAuthStore } from '@/stores/authStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwnerOrSuper = user?.role === 'superadmin' || user?.role === 'owner';

  // Chart range state: 7 days, 14 days, 30 days
  const [chartDays, setChartDays] = useState<number>(7);

  const getStartDate = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1));
    return d.toISOString().split('T')[0];
  };

  const getEndDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Queries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
    refetchInterval: 60000, // Auto refresh every 1 minute
  });

  const {
    data: chartData,
    isLoading: isChartLoading,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ['dashboard-chart', chartDays],
    queryFn: () =>
      dashboardApi.getChart({
        start_date: getStartDate(chartDays),
        end_date: getEndDate(),
      }),
  });

  const {
    data: poReminders,
    isLoading: isRemindersLoading,
    refetch: refetchReminders,
  } = useQuery({
    queryKey: ['dashboard-po-reminders'],
    queryFn: () => dashboardApi.getPOReminders(),
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchChart();
    refetchReminders();
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-700" />
            Ringkasan Toko & Kasir
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {todayFormatted} • Selamat datang kembali,{' '}
            <span className="font-semibold text-stone-800">{user?.name}</span> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isSummaryRefetching}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSummaryRefetching ? 'animate-spin' : ''}`}
              />
            }
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/pos')}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Buka Kasir (POS)
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Revenue */}
        <Card className="p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Omset Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-stone-900">
              {isSummaryLoading ? '...' : formatRupiah(summary?.today_revenue || 0)}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Akumulasi pembayaran masuk hari ini
            </p>
          </div>
        </Card>

        {/* Card 2: Today Transactions */}
        <Card className="p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Transaksi Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-stone-900">
              {isSummaryLoading ? '...' : `${summary?.today_transactions || 0}`}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Pesanan selesai & tercatat
            </p>
          </div>
        </Card>

        {/* Card 3: Active Pre-Orders */}
        <Card className="p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Pre-Order Aktif
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-stone-900">
              {isSummaryLoading ? '...' : `${summary?.active_pre_orders || 0}`}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              PO dalam proses persiapan / belum diambil
            </p>
          </div>
        </Card>

        {/* Card 4: Gross Profit (Role Protected) or Average Ticket */}
        {isOwnerOrSuper ? (
          <Card className="p-5 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Laba Kotor Hari Ini
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-emerald-800">
                {isSummaryLoading
                  ? '...'
                  : formatRupiah(summary?.today_gross_profit || 0)}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Margin kotor (Omset - HPP Produk)
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-5 border-l-4 border-l-stone-400 bg-stone-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Laba Kotor Toko
              </span>
              <div className="p-2 rounded-xl bg-stone-200 text-stone-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-stone-600">
                Privasi Terlindungi
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Data HPP & Laba khusus Owner / Superadmin
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Main Grid: Left Chart + Right PO Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Tren Penjualan Toko
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Grafik total pendapatan dan frekuensi pesanan harian
                </p>
              </div>

              {/* Range Selector */}
              <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-1 text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartDays(7)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    chartDays === 7
                      ? 'bg-white font-bold text-amber-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setChartDays(14)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    chartDays === 14
                      ? 'bg-white font-bold text-amber-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  14 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setChartDays(30)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    chartDays === 30
                      ? 'bg-white font-bold text-amber-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            <div className="pt-3">
              <SalesBarChart
                data={chartData || []}
                isLoading={isChartLoading}
              />
            </div>
          </Card>
        </div>

        {/* PO Reminders Widget (1 col) */}
        <div className="lg:col-span-1">
          <POReminderWidget
            orders={poReminders || []}
            isLoading={isRemindersLoading}
          />
        </div>
      </div>
    </div>
  );
};
