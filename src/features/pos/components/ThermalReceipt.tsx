import React from 'react';
import { Printer, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/utils/currency';
import { useUiStore } from '@/stores/uiStore';
import type { Order } from '@/features/orders/types/order';
import type { StoreSetting } from '@/features/settings/types/settings';

export interface ThermalReceiptProps {
  order: Order;
  storeSettings?: StoreSetting | null;
  onDone?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  order,
  storeSettings,
  onDone,
}) => {
  const { thermalWidth } = useUiStore();

  const storeName = storeSettings?.name || 'Toko Makanan';
  const storeAddress = storeSettings?.address || 'Alamat Toko Roti';
  const storePhone = storeSettings?.phone || '';
  const receiptFooter =
    storeSettings?.receipt_footer || 'Terima kasih atas kunjungan Anda!';

  // Calculate change (kembalian)
  const paidAmount = order.total_paid;
  const changeAmount = Math.max(0, paidAmount - order.total_amount);
  const remainingBill = Math.max(0, order.total_amount - paidAmount);

  // Generate public digital invoice URL
  const publicInvoiceUrl = `${window.location.origin}/invoice/${order.invoice_token}`;

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareUrl = (): string => {
    const text = encodeURIComponent(
      `Halo ${order.customer_name || 'Pelanggan'},\nTerima kasih telah berbelanja di *${storeName}*.\n\nBerikut nota digital transaksi Anda:\nNo. Invoice: *${order.invoice_no}*\nTotal: *${formatRupiah(order.total_amount)}*\n\nBuka nota lengkap: ${publicInvoiceUrl}`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Screen Only */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-2.5 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Transaksi Berhasil Disimpan!</h4>
            <p className="text-xs text-emerald-700">
              No. Invoice: <span className="font-mono font-bold">{order.invoice_no}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim WA</span>
          </a>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Struk ({thermalWidth})
          </Button>

          {onDone && (
            <Button variant="outline" size="sm" onClick={onDone}>
              Transaksi Baru
            </Button>
          )}
        </div>
      </div>

      {/* Printable Thermal Receipt Paper Container */}
      <div className="flex justify-center">
        <div
          className={
            thermalWidth === '80mm'
              ? 'thermal-receipt-80mm bg-white border border-stone-200 p-4 rounded-xl shadow-xs'
              : 'thermal-receipt-58mm bg-white border border-stone-200 p-3 rounded-xl shadow-xs'
          }
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-stone-400">
            <h2 className="font-bold text-sm uppercase tracking-wide text-stone-900">
              {storeName}
            </h2>
            <p className="text-[11px] text-stone-600">{storeAddress}</p>
            {storePhone && <p className="text-[11px] text-stone-600">Telp: {storePhone}</p>}
          </div>

          {/* Meta */}
          <div className="py-2 border-b border-dashed border-stone-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold">{order.invoice_no}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{order.user_name || 'Kasir'}</span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{order.customer_name}</span>
              </div>
            )}
            {order.order_type === 'PRE_ORDER' && order.pickup_date && (
              <div className="flex justify-between font-bold text-stone-900">
                <span>Tgl Pengambilan:</span>
                <span>{order.pickup_date}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="py-2 border-b border-dashed border-stone-400 space-y-1.5 text-[11px]">
            {order.items.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="font-medium text-stone-900">{item.item_name}</div>
                <div className="flex justify-between text-stone-600 pl-2">
                  <span>
                    {item.quantity} x {formatRupiah(item.unit_price)}
                  </span>
                  <span className="font-semibold text-stone-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-stone-700">
                <span>Diskon:</span>
                <span>- {formatRupiah(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-stone-300">
              <span>TOTAL:</span>
              <span>{formatRupiah(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode:</span>
              <span>{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span>{formatRupiah(paidAmount)}</span>
            </div>
            {changeAmount > 0 && (
              <div className="flex justify-between font-semibold">
                <span>Kembalian:</span>
                <span>{formatRupiah(changeAmount)}</span>
              </div>
            )}
            {remainingBill > 0 && (
              <div className="flex justify-between font-bold text-stone-900 pt-0.5">
                <span>Sisa Tagihan:</span>
                <span>{formatRupiah(remainingBill)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="py-1 text-[10px] text-stone-500 italic border-t border-dashed border-stone-300">
              Catatan: {order.notes}
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 text-center text-[10px] text-stone-600 italic border-t border-dashed border-stone-400">
            {receiptFooter}
            <div className="mt-1 font-mono text-[9px] text-stone-400">
              {publicInvoiceUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
