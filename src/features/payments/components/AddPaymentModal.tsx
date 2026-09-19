import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { paymentsApi } from '../api/paymentsApi';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import { CreditCard, Banknote, QrCode, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from '@/core/types/common';

export interface AddPaymentModalProps {
  orderId: number;
  invoiceNo: string;
  remainingBill: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  orderId,
  invoiceNo,
  remainingBill,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number | ''>(remainingBill);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericAmount = typeof amount === 'number' ? amount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numericAmount <= 0) {
      setErrorMsg('Nominal pembayaran harus lebih dari Rp 0');
      return;
    }

    if (numericAmount > remainingBill) {
      setErrorMsg(
        `Nominal (${formatRupiah(numericAmount)}) tidak boleh melebihi sisa tagihan (${formatRupiah(
          remainingBill
        )})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentsApi.addPayment(orderId, {
        amount: numericAmount,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });

      toast.success('Pembayaran berhasil dicatat');
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      toast.error('Gagal mencatat pembayaran', parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pembayaran / Pelunasan"
      description={`Catat pembayaran susulan untuk invoice ${invoiceNo}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {errorMsg && (
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Sisa Tagihan Belum Lunas
          </span>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-0.5">
            {formatRupiah(remainingBill)}
          </div>
        </div>

        {/* Method */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={cn(
                'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold cursor-pointer',
                paymentMethod === 'TRANSFER'
                  ? 'border-amber-600 bg-amber-50/60 text-amber-900'
                  : 'border-stone-200 bg-white text-stone-600'
              )}
            >
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={cn(
                'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold cursor-pointer',
                paymentMethod === 'CASH'
                  ? 'border-amber-600 bg-amber-50/60 text-amber-900'
                  : 'border-stone-200 bg-white text-stone-600'
              )}
            >
              <Banknote className="w-4 h-4 text-amber-700" />
              <span>Tunai</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('QRIS')}
              className={cn(
                'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold cursor-pointer',
                paymentMethod === 'QRIS'
                  ? 'border-amber-600 bg-amber-50/60 text-amber-900'
                  : 'border-stone-200 bg-white text-stone-600'
              )}
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>QRIS</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Nominal yang Dibayar (Rp)
            </label>
            <button
              type="button"
              onClick={() => setAmount(remainingBill)}
              className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
            >
              Lunasi Penuh ({formatRupiah(remainingBill)})
            </button>
          </div>
          <input
            type="number"
            min="1"
            max={remainingBill}
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-base font-bold font-mono text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            required
          />
        </div>

        <Input
          label="Catatan Pembayaran (Opsional)"
          placeholder="cth: Pelunasan sisa PO via BCA"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
};
