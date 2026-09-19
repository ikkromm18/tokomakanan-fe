import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  PlusCircle,
  Calendar,
  User,
  Clock,
  Receipt,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import { ordersApi } from '../api/ordersApi';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { AddPaymentModal } from '@/features/payments/components/AddPaymentModal';
import { ThermalReceipt } from '@/features/pos/components/ThermalReceipt';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import { useAuthStore } from '@/stores/authStore';
import type { OrderStatus } from '@/core/types/common';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['DP_PAID', 'PAID', 'CANCELLED'],
  DP_PAID: ['PAID', 'CANCELLED'],
  PAID: ['READY', 'COMPLETED', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  DP_PAID: 'DP Terbayar',
  PAID: 'Lunas Penuh',
  READY: 'Siap Diambil',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<OrderStatus | null>(null);

  const canSeeHpp = user?.role === 'superadmin' || user?.role === 'owner';

  const orderId = Number(id);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: !Number.isNaN(orderId) && orderId > 0,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      ordersApi.updateStatus(orderId, { status: newStatus }),
    onSuccess: () => {
      toast.success('Status pesanan berhasil diperbarui');
      setStatusConfirmTarget(null);
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error('Gagal memperbarui status', parsed.message);
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <LoadingSpinner text="Memuat detail pesanan..." size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-rose-500" />}
          title="Pesanan Tidak Ditemukan"
          description="Pesanan tidak ditemukan atau terjadi kesalahan saat mengambil data."
          action={
            <Button variant="outline" onClick={() => navigate('/orders')}>
              Kembali ke Daftar Pesanan
            </Button>
          }
        />
      </div>
    );
  }

  const remainingBill = Math.max(0, order.total_amount - order.total_paid);
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED';
  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] || [];
  const publicInvoiceUrl = `${window.location.origin}/invoice/${order.invoice_token}`;

  const getWhatsAppShareUrl = (): string => {
    const storeName = settings?.name || 'Toko Makanan';
    const text = encodeURIComponent(
      `Halo ${order.customer_name || 'Pelanggan'},\nTerima kasih atas pesanan Anda di *${storeName}*.\n\nBerikut nota transaksi Anda:\nNo. Invoice: *${order.invoice_no}*\nStatus: *${STATUS_LABELS[order.status]}*\nTotal: *${formatRupiah(order.total_amount)}*\nSisa Tagihan: *${formatRupiah(remainingBill)}*\n\nBuka nota digital: ${publicInvoiceUrl}`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/orders')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-mono">
                {order.invoice_no}
              </h1>
              <OrderStatusBadge status={order.status} size="md" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-700">
                {order.order_type === 'PRE_ORDER' ? 'Pre-Order' : 'Direct Sale'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Dibuat pada{' '}
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              oleh <span className="font-medium text-stone-700">{order.user_name || 'Kasir'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim WA</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Struk
          </Button>

          {remainingBill > 0 && !isTerminal && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddPaymentOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Tambah Pembayaran
            </Button>
          )}
        </div>
      </div>

      {/* Alert banner if unfulfilled bill remains */}
      {remainingBill > 0 && !isTerminal && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Sisa Tagihan Belum Lunas: {formatRupiah(remainingBill)}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Total transaksi {formatRupiah(order.total_amount)} baru terbayar {formatRupiah(order.total_paid)}.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddPaymentOpen(true)}
            className="shrink-0"
          >
            Lunasi Sekarang
          </Button>
        </div>
      )}

      {/* Status Transition Control (if not terminal) */}
      {!isTerminal && allowedNextStatuses.length > 0 && (
        <Card className="p-4 bg-stone-50 border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Ubah Status Pesanan
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                Status saat ini: <strong className="text-stone-800">{STATUS_LABELS[order.status]}</strong>. Pilih status berikutnya sesuai alur proses.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {allowedNextStatuses.map((nextSt) => (
                <Button
                  key={nextSt}
                  size="sm"
                  variant={nextSt === 'CANCELLED' ? 'danger' : 'outline'}
                  onClick={() => setStatusConfirmTarget(nextSt)}
                  disabled={updateStatusMutation.isPending}
                >
                  {nextSt === 'COMPLETED' ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Selesaikan Pesanan
                    </span>
                  ) : nextSt === 'CANCELLED' ? (
                    'Batalkan Pesanan'
                  ) : (
                    `Set ke ${STATUS_LABELS[nextSt]}`
                  )}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table Card */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                Daftar Produk & Item ({order.items?.length || 0})
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Tipe</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  {canSeeHpp && <TableHead className="text-right text-stone-500">HPP Unit</TableHead>}
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-stone-900 text-xs">
                      {item.item_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 uppercase">
                        {item.item_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-stone-700">
                      {formatRupiah(item.unit_price)}
                    </TableCell>
                    {canSeeHpp && (
                      <TableCell className="text-right font-mono text-xs text-stone-500">
                        {item.unit_hpp ? formatRupiah(item.unit_hpp) : '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono text-xs font-bold text-stone-900">
                      {formatRupiah(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Payment Records Table Card */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                Riwayat Pembayaran ({order.payments?.length || 0})
              </h3>
              {remainingBill > 0 && !isTerminal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddPaymentOpen(true)}
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  Tambah Bayar
                </Button>
              )}
            </div>
            {!order.payments || order.payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                Belum ada catatan pembayaran.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu Bayar</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-stone-600 whitespace-nowrap">
                        {new Date(p.paid_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {p.payment_method}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {p.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-700">
                        {formatRupiah(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Right Col: Customer & Financial Summary */}
        <div className="space-y-6">
          {/* Order & Customer Metadata Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-100 pb-3">
              <User className="w-4 h-4 text-amber-700" />
              Informasi Pesanan & Pelanggan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-500 block">Nama Pelanggan</span>
                <span className="font-semibold text-stone-900 text-sm">
                  {order.customer_name || 'Walk-in Customer'}
                </span>
              </div>

              {order.order_type === 'PRE_ORDER' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>Jadwal Pengambilan (PO)</span>
                  </div>
                  <p className="text-stone-800 font-mono text-sm font-semibold pl-5.5">
                    {order.pickup_date
                      ? new Date(order.pickup_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Belum ditentukan'}
                  </p>
                </div>
              )}

              {order.notes && (
                <div>
                  <span className="text-stone-500 block">Catatan Pesanan</span>
                  <p className="mt-1 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs italic">
                    "{order.notes}"
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-stone-600">
                <span>Tautan Nota Digital</span>
                <a
                  href={publicInvoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 hover:text-amber-800 font-medium underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Buka
                </a>
              </div>
            </div>
          </Card>

          {/* Financial Summary Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3">
              Ringkasan Keuangan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Items</span>
                <span className="font-mono">{formatRupiah(order.subtotal)}</span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon</span>
                  <span className="font-mono">- {formatRupiah(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200 text-sm">
                <span>Total Tagihan</span>
                <span className="font-mono text-amber-900">{formatRupiah(order.total_amount)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Terbayar</span>
                <span className="font-mono">{formatRupiah(order.total_paid)}</span>
              </div>

              <div className="flex justify-between font-bold pt-2 border-t border-stone-100">
                <span>Sisa Tagihan</span>
                <span
                  className={`font-mono text-sm ${
                    remainingBill > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'
                  }`}
                >
                  {remainingBill > 0 ? formatRupiah(remainingBill) : 'Lunas'}
                </span>
              </div>

              {/* Masked HPP & Profit for Superadmin/Owner only */}
              {canSeeHpp && order.total_hpp !== null && order.total_hpp !== undefined && (
                <div className="mt-4 pt-3 border-t border-dashed border-stone-300 space-y-2 bg-stone-50 p-2.5 rounded-lg">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Analisis Margin Toko (Internal)
                  </div>
                  <div className="flex justify-between text-stone-600 text-xs">
                    <span>Total HPP Modal</span>
                    <span className="font-mono">{formatRupiah(order.total_hpp)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800 text-xs">
                    <span>Estimasi Laba Kotor</span>
                    <span className="font-mono">
                      {formatRupiah(order.total_amount - order.total_hpp)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        orderId={order.id}
        invoiceNo={order.invoice_no}
        remainingBill={remainingBill}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }}
      />

      {/* Reprint Thermal Receipt Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Cetak Ulang Struk Kasir"
        description={`Invoice ${order.invoice_no}`}
        maxWidth="lg"
      >
        <ThermalReceipt
          order={order}
          storeSettings={settings}
          onDone={() => setIsPrintModalOpen(false)}
          doneLabel="Tutup"
        />
      </Modal>

      {/* Status Transition Confirmation Modal */}
      <Modal
        isOpen={Boolean(statusConfirmTarget)}
        onClose={() => setStatusConfirmTarget(null)}
        title="Konfirmasi Perubahan Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Apakah Anda yakin ingin mengubah status pesanan{' '}
            <strong className="font-mono text-stone-900">{order.invoice_no}</strong> menjadi{' '}
            <strong className="text-amber-800">
              {statusConfirmTarget ? STATUS_LABELS[statusConfirmTarget] : ''}
            </strong>
            ?
          </p>

          {statusConfirmTarget === 'CANCELLED' && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              Peringatan: Pesanan yang dibatalkan bersifat permanen dan tidak dapat diubah kembali.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusConfirmTarget(null)}
              disabled={updateStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant={statusConfirmTarget === 'CANCELLED' ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                if (statusConfirmTarget) {
                  updateStatusMutation.mutate(statusConfirmTarget);
                }
              }}
              isLoading={updateStatusMutation.isPending}
            >
              Ya, Ubah Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
