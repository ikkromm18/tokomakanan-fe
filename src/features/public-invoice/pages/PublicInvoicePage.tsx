import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Printer,
  MessageCircle,
  Store,
  Calendar,
  Clock,
  FileQuestion,
  Phone,
  MapPin,
} from 'lucide-react';
import { publicInvoiceApi } from '../api/publicInvoiceApi';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatRupiah } from '@/utils/currency';
import type { OrderStatus } from '@/core/types/common';

export const PublicInvoicePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['public-invoice', token],
    queryFn: () => publicInvoiceApi.getByToken(token || ''),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <LoadingSpinner text="Memuat nota digital..." size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <EmptyState
            icon={<FileQuestion className="w-8 h-8 text-rose-500" />}
            title="Nota Tidak Ditemukan"
            description="Tautan nota digital tidak valid atau pesanan tidak ditemukan. Silakan hubungi kasir toko untuk bantuan."
          />
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, invoice.total_amount - invoice.total_paid);
  const change = Math.max(0, invoice.total_paid - invoice.total_amount);

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = window.location.href;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Nota Transaksi ${invoice.store.name} - No: ${invoice.invoice_no}: ${currentUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Floating Actions (Hidden when printing) */}
        <div className="no-print flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-stone-700">Nota Digital Resmi</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Bagi WA</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Cetak / PDF
            </Button>
          </div>
        </div>

        {/* Paper Invoice Container */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Top Decorative Border */}
          <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Store Header */}
            <div className="text-center space-y-1.5 pb-5 border-b border-dashed border-stone-200">
              {invoice.store.logo_url ? (
                <img
                  src={invoice.store.logo_url}
                  alt={invoice.store.name}
                  className="w-16 h-16 mx-auto object-contain mb-2 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Store className="w-6 h-6" />
                </div>
              )}
              <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
                {invoice.store.name}
              </h1>
              {invoice.store.address && (
                <p className="text-xs text-stone-500 max-w-sm mx-auto flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{invoice.store.address}</span>
                </p>
              )}
              {invoice.store.phone && (
                <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{invoice.store.phone}</span>
                </p>
              )}
            </div>

            {/* Invoice Meta Grid */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Nomor Invoice
                  </span>
                  <div className="text-sm font-mono font-bold text-amber-900">
                    {invoice.invoice_no}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={invoice.status as OrderStatus} size="sm" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-stone-200 text-stone-700">
                    {invoice.order_type === 'PRE_ORDER' ? 'Pre-Order' : 'Direct Sale'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Tanggal Transaksi:</span>
                  <span className="font-medium text-stone-800">
                    {new Date(invoice.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Pelanggan:</span>
                  <span className="font-semibold text-stone-900 truncate block">
                    {invoice.customer_name || 'Pelanggan Umum (Walk-in)'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Kasir:</span>
                  <span className="text-stone-700">{invoice.cashier_name}</span>
                </div>
              </div>

              {/* Pre-Order Pickup Date Alert */}
              {invoice.order_type === 'PRE_ORDER' && invoice.pickup_date && (
                <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-semibold">
                  <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Jadwal Pengambilan:{' '}
                    {new Date(invoice.pickup_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Itemized Order List */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-1 border-b border-stone-100">
                Rincian Pesanan
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">{item.item_name}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.quantity} x {formatRupiah(item.unit_price)}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-stone-900 shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
              </div>

              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Potongan Diskon</span>
                  <span className="font-mono">- {formatRupiah(invoice.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Belanja</span>
                <span className="font-mono text-amber-900">{formatRupiah(invoice.total_amount)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Dibayar</span>
                <span className="font-mono">{formatRupiah(invoice.total_paid)}</span>
              </div>

              <div className="flex justify-between font-bold pt-1.5 border-t border-stone-100">
                <span>Status Pembayaran</span>
                {remaining > 0 ? (
                  <span className="text-rose-600 font-mono">
                    Sisa Tagihan: {formatRupiah(remaining)}
                  </span>
                ) : change > 0 ? (
                  <span className="text-stone-700 font-mono">
                    Kembalian: {formatRupiah(change)}
                  </span>
                ) : (
                  <span className="text-emerald-700">LUNAS</span>
                )}
              </div>
            </div>

            {/* Payment Records (if available) */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="pt-3 border-t border-dashed border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Riwayat Pembayaran
                </span>
                <div className="space-y-1 text-xs">
                  {invoice.payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-stone-600 py-1 border-b border-stone-50"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span className="font-medium text-stone-800">{p.payment_method}</span>
                        <span className="text-stone-400 text-[11px]">
                          ({new Date(p.paid_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })})
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-emerald-700">
                        {formatRupiah(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {invoice.notes && (
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 italic">
                <strong>Catatan:</strong> "{invoice.notes}"
              </div>
            )}

            {/* Footer Notice */}
            <div className="text-center pt-4 border-t border-dashed border-stone-200 space-y-1">
              <p className="text-xs font-medium text-stone-700">
                {invoice.store.receipt_footer || 'Terima kasih atas kunjungan dan kepercayaan Anda!'}
              </p>
              <p className="text-[10px] text-stone-400">
                Simpan tautan ini untuk bukti transaksi dan jadwal pengambilan pesanan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
