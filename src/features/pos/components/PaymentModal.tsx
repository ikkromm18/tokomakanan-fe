import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode, ArrowRight, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePosCartStore } from '@/stores/posCartStore';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from '@/core/types/common';
import type { Order } from '@/features/orders/types/order';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    items,
    orderType,
    customer,
    pickupDate,
    notes,
    discountAmount,
    getTotalAmount,
    clearCart,
  } = usePosCartStore();

  const totalAmount = getTotalAmount();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidInput, setPaidInput] = useState<number | ''>(() =>
    orderType === 'DIRECT_SALE' ? totalAmount : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericPaid = typeof paidInput === 'number' ? paidInput : 0;
  const changeAmount = Math.max(0, numericPaid - totalAmount);
  const remainingBill = Math.max(0, totalAmount - numericPaid);

  // Suggested Cash buttons based on total
  const suggestedAmounts = [
    totalAmount, // Uang Pas
    Math.ceil(totalAmount / 20000) * 20000,
    Math.ceil(totalAmount / 50000) * 50000,
    Math.ceil(totalAmount / 100000) * 100000,
  ].filter((val, idx, self) => val >= totalAmount && self.indexOf(val) === idx);

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'TRANSFER' || method === 'QRIS') {
      // Non-cash defaults to full amount
      setPaidInput(totalAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Business validation
    if (orderType === 'DIRECT_SALE' && numericPaid < totalAmount) {
      setErrorMsg(
        `Pembayaran penjualan langsung (Direct Sale) harus lunas penuh (Minimal ${formatRupiah(
          totalAmount
        )})`
      );
      return;
    }

    if (numericPaid > totalAmount && paymentMethod !== 'CASH') {
      setErrorMsg('Pembayaran via Transfer atau QRIS tidak boleh melebihi total tagihan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ordersApi.create({
        customer_id: customer?.id || null,
        order_type: orderType,
        pickup_date: orderType === 'PRE_ORDER' ? pickupDate : null,
        notes: notes || undefined,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        initial_paid: numericPaid,
        items: items.map((it) => ({
          item_type: it.item_type,
          item_id: it.item_id,
          quantity: it.quantity,
        })),
      });

      toast.success(`Transaksi ${response.invoice_no} berhasil diproses!`);
      clearCart();
      onClose();
      onSuccess(response);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      toast.error('Gagal memproses transaksi', parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Selesaikan Pembayaran"
      description={
        orderType === 'PRE_ORDER'
          ? `Pre-Order untuk ${customer?.name || 'Pelanggan'} (Pickup: ${pickupDate})`
          : 'Penjualan Langsung Kasir (Direct Sale)'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Total Bill Box */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Total yang Harus Dibayar
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono mt-0.5">
            {formatRupiah(totalAmount)}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectMethod('CASH')}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                paymentMethod === 'CASH'
                  ? 'border-amber-600 bg-amber-50/50 text-amber-900 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              )}
            >
              <Banknote className="w-5 h-5 text-amber-700" />
              <span>Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMethod('TRANSFER')}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                paymentMethod === 'TRANSFER'
                  ? 'border-amber-600 bg-amber-50/50 text-amber-900 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              )}
            >
              <CreditCard className="w-5 h-5 text-blue-700" />
              <span>Transfer Bank</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMethod('QRIS')}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                paymentMethod === 'QRIS'
                  ? 'border-amber-600 bg-amber-50/50 text-amber-900 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              )}
            >
              <QrCode className="w-5 h-5 text-emerald-700" />
              <span>QRIS</span>
            </button>
          </div>
        </div>

        {/* Amount Paid Input & Presets (Mainly for CASH) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            {orderType === 'PRE_ORDER' ? 'Nominal Pembayaran / DP (Rp)' : 'Uang Diterima (Rp)'}
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="0"
              value={paidInput}
              onChange={(e) =>
                setPaidInput(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-lg font-bold font-mono text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {/* Preset Buttons */}
          {paymentMethod === 'CASH' && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaidInput(amt)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-xs font-mono font-medium text-stone-700 transition-colors cursor-pointer"
                >
                  {amt === totalAmount ? 'Uang Pas' : formatRupiah(amt)}
                </button>
              ))}
              {orderType === 'PRE_ORDER' && (
                <button
                  type="button"
                  onClick={() => setPaidInput(0)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-amber-50 text-xs font-mono font-medium text-stone-700 transition-colors cursor-pointer"
                >
                  DP Rp 0 (Draft)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Change / Kembalian Calculation Box */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-sm font-mono">
          <div className="flex justify-between items-center text-stone-600 text-xs">
            <span>Uang Diterima:</span>
            <span>{formatRupiah(numericPaid)}</span>
          </div>

          {changeAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-700 font-bold border-t border-stone-200 pt-2 text-base">
              <span>KEMBALIAN:</span>
              <span>{formatRupiah(changeAmount)}</span>
            </div>
          )}

          {remainingBill > 0 && orderType === 'PRE_ORDER' && (
            <div className="flex justify-between items-center text-amber-800 font-bold border-t border-stone-200 pt-2">
              <span>Sisa Tagihan Pelunasan:</span>
              <span>{formatRupiah(remainingBill)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Selesaikan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
