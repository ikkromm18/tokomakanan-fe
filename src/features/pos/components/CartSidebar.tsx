import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  User,
  Calendar,
  CreditCard,
  UserPlus,
  Percent,
} from 'lucide-react';
import { usePosCartStore } from '@/stores/posCartStore';
import { customerApi } from '@/features/customers/api/customerApi';
import { CustomerModal } from '@/features/customers/components/CustomerModal';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/utils/currency';
import { cn } from '@/utils/cn';
import type { Customer } from '@/features/customers/types/customer';

export interface CartSidebarProps {
  onProceedPayment: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  onProceedPayment,
}) => {
  const {
    items,
    orderType,
    customer,
    pickupDate,
    notes,
    discountAmount,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    setOrderType,
    setCustomer,
    setPickupDate,
    setNotes,
    setDiscountAmount,
    clearCart,
    getSubtotal,
    getTotalAmount,
    getTotalItems,
  } = usePosCartStore();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Fetch active customers for quick selection
  const { data: customersData } = useQuery({
    queryKey: ['customers-pos-list'],
    queryFn: () => customerApi.list({ limit: 100 }),
  });

  const customerList = customersData?.data || [];
  const subtotal = getSubtotal();
  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  const todayStr = new Date().toISOString().split('T')[0];

  // Validation before proceed:
  // If PRE_ORDER, customer and pickupDate are mandatory!
  const isPreOrderMissingRequired =
    orderType === 'PRE_ORDER' && (!customer || !pickupDate);

  const canProceed = items.length > 0 && !isPreOrderMissingRequired;

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setCustomer(null);
    } else {
      const found = customerList.find((c) => c.id === Number(val));
      setCustomer(found || null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/90 shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 leading-none">
              Keranjang Kasir
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">
              {totalItems} item dipilih
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Kosongkan
          </button>
        )}
      </div>

      {/* Order Type Toggle Tabs */}
      <div className="p-3 bg-stone-100/60 border-b border-stone-200/60">
        <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setOrderType('DIRECT_SALE')}
            className={cn(
              'py-1.5 rounded-lg transition-all cursor-pointer',
              orderType === 'DIRECT_SALE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            )}
          >
            Direct Sale
          </button>
          <button
            type="button"
            onClick={() => setOrderType('PRE_ORDER')}
            className={cn(
              'py-1.5 rounded-lg transition-all cursor-pointer',
              orderType === 'PRE_ORDER'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            )}
          >
            Pre-Order (PO)
          </button>
        </div>

        {/* Pre-Order Specific Controls */}
        {orderType === 'PRE_ORDER' && (
          <div className="mt-3 space-y-2.5 pt-2.5 border-t border-stone-200/80 animate-fadeIn">
            {/* Customer select with quick-add button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-700" />
                  <span>Pelanggan PO (Wajib)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Tambah Baru</span>
                </button>
              </div>
              <select
                value={customer?.id || ''}
                onChange={handleSelectCustomer}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
              >
                <option value="">-- Pilih Pelanggan Terdaftar --</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Pickup Date picker */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-700" />
                <span>Tanggal Pengambilan (Wajib)</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <ShoppingBag className="w-10 h-10 stroke-1 mb-2 text-stone-300" />
            <p className="text-xs font-medium text-stone-500">
              Keranjang masih kosong
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Pilih menu dari katalog di sebelah kiri
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartId}
              className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/40 hover:bg-stone-50 transition-all flex flex-col gap-2 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-mono text-stone-500">
                    {formatRupiah(item.unit_price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartId)}
                  className="text-stone-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title="Hapus item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity Counter & Subtotal */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => decrementQuantity(item.cartId)}
                    className="flex h-6 w-6 items-center justify-center rounded text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementQuantity(item.cartId)}
                    className="flex h-6 w-6 items-center justify-center rounded text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="text-xs font-bold font-mono text-stone-900">
                  {formatRupiah(item.unit_price * item.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer / Checkout Bar */}
      <div className="p-4 border-t border-stone-200 bg-white space-y-3 shadow-lg">
        {/* Quick discount button / input */}
        <div>
          {!showDiscountInput ? (
            <button
              type="button"
              onClick={() => setShowDiscountInput(true)}
              className="text-xs font-semibold text-stone-500 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>
                {discountAmount > 0
                  ? `Diskon: ${formatRupiah(discountAmount)} (Ubah)`
                  : 'Tambah Diskon Manual'}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Nominal Diskon (Rp)"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowDiscountInput(false)}
                className="text-xs text-stone-500 hover:text-stone-900 px-2 py-1 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          )}
        </div>

        {/* Notes input */}
        <input
          type="text"
          placeholder="Catatan pesanan (opsional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-600"
        />

        {/* Pricing Math */}
        <div className="space-y-1 text-xs border-t border-stone-100 pt-2 font-mono">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Diskon:</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1 text-sm font-bold text-stone-900 border-t border-stone-200">
            <span className="font-sans">Total Tagihan:</span>
            <span className="text-base text-amber-700">
              {formatRupiah(totalAmount)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={!canProceed}
          onClick={onProceedPayment}
          className="w-full font-bold shadow-md shadow-amber-600/20"
          leftIcon={<CreditCard className="w-5 h-5" />}
        >
          {orderType === 'PRE_ORDER' ? 'Proses Pre-Order' : 'Bayar Sekarang'}
        </Button>
      </div>

      {/* Customer Create Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={(newCustomer) => {
          if (newCustomer) {
            setCustomer(newCustomer);
          }
        }}
      />
    </div>
  );
};
