import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ReceiptText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersApi } from '../api/ordersApi';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatRupiah } from '@/utils/currency';
import type { OrderQueryParams } from '../types/order';
import type { OrderStatus, OrderType } from '@/core/types/common';

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();

  const [params, setParams] = useState<OrderQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    order_type: '',
    status: '',
    start_date: '',
    end_date: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.list(params),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, order_type: e.target.value as OrderType | '', page: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, status: e.target.value as OrderStatus | '', page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Riwayat Pesanan & Transaksi
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Daftar seluruh transaksi Direct Sale dan Pre-Order kasir toko.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/pos')}
        >
          Buka Kasir (POS)
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Cari nomor invoice / nama pelanggan..."
            value={params.search}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Order Type */}
        <div>
          <select
            value={params.order_type || ''}
            onChange={handleTypeFilter}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
          >
            <option value="">Semua Tipe Order</option>
            <option value="DIRECT_SALE">Direct Sale (Penjualan Langsung)</option>
            <option value="PRE_ORDER">Pre-Order (PO)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={params.status || ''}
            onChange={handleStatusFilter}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="DP_PAID">DP Terbayar</option>
            <option value="PAID">Lunas Penuh</option>
            <option value="READY">Siap Diambil</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            placeholder="Mulai Tanggal"
            value={params.start_date || ''}
            onChange={(e) => setParams((p) => ({ ...p, start_date: e.target.value, page: 1 }))}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
          />
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingSpinner text="Memuat riwayat transaksi..." size="lg" />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="w-7 h-7" />}
          title="Tidak Ada Pesanan"
          description="Belum ada transaksi yang sesuai dengan filter atau kata kunci pencarian Anda."
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Terbayar</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((order) => {
                const remaining = Math.max(0, order.total_amount - order.total_paid);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-bold text-amber-900">
                      {order.invoice_no}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-stone-800">
                      {order.customer_name || 'Walk-in'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
                        {order.order_type === 'PRE_ORDER' ? 'PO' : 'Direct'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-stone-900">
                      {formatRupiah(order.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-700 font-medium">
                      {formatRupiah(order.total_paid)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium text-stone-600">
                      {remaining > 0 ? (
                        <span className="text-rose-600 font-bold">{formatRupiah(remaining)}</span>
                      ) : (
                        <span className="text-emerald-700">Lunas</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-stone-500">
              <p>
                Halaman {data.meta.page} dari {data.meta.total_pages} ({data.meta.total_rows} total transaksi)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === 1}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === data.meta.total_pages}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
