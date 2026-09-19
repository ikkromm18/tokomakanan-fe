import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { packageApi } from '../api/packageApi';
import { productApi } from '@/features/products/api/productApi';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import type { Package, PackageItemInput } from '../types/package';

export interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageToEdit?: Package | null;
  onSuccess: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  packageToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(packageToEdit);

  const [name, setName] = useState('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<PackageItemInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all active products for the dropdown selector
  const { data: productsData } = useQuery({
    queryKey: ['products-all-for-package'],
    queryFn: () => productApi.list({ limit: 100, is_active: true }),
    enabled: isOpen,
  });

  const productList = productsData?.data || [];

  useEffect(() => {
    if (packageToEdit) {
      setName(packageToEdit.name);
      setSellPrice(packageToEdit.sell_price);
      setIsActive(packageToEdit.is_active);
      setItems(
        packageToEdit.items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        }))
      );
    } else {
      setName('');
      setSellPrice('');
      setIsActive(true);
      setItems([]);
    }
    setErrorMsg(null);
  }, [packageToEdit, isOpen]);

  const addItemRow = () => {
    if (productList.length === 0) return;
    const available = productList.find(
      (p) => !items.some((it) => it.product_id === p.id)
    );
    if (!available) {
      toast.warning('Semua produk yang tersedia sudah masuk dalam daftar item');
      return;
    }
    setItems((prev) => [...prev, { product_id: available.id, quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: 'product_id' | 'quantity', val: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Real-time calculation of total HPP and standard sell price of individual items
  let computedHpp = 0;
  let standardSeparatePrice = 0;

  for (const item of items) {
    const product = productList.find((p) => p.id === item.product_id);
    if (product) {
      computedHpp += (product.hpp || 0) * item.quantity;
      standardSeparatePrice += product.sell_price * item.quantity;
    }
  }

  const numericSellPrice = typeof sellPrice === 'number' ? sellPrice : 0;
  const estimatedSavings = standardSeparatePrice > numericSellPrice ? standardSeparatePrice - numericSellPrice : 0;
  const estimatedProfit = numericSellPrice - computedHpp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Nama paket wajib diisi');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Minimal satu produk harus dipilih ke dalam paket');
      return;
    }

    // Check duplicate products
    const productIds = items.map((it) => it.product_id);
    if (new Set(productIds).size !== productIds.length) {
      setErrorMsg('Terdapat produk duplikat di dalam paket. Harap satukan dalam kuantitas.');
      return;
    }

    if (numericSellPrice <= 0) {
      setErrorMsg('Harga jual paket harus lebih dari Rp 0');
      return;
    }

    if (numericSellPrice < computedHpp) {
      setErrorMsg(`Harga jual paket (${formatRupiah(numericSellPrice)}) tidak boleh lebih murah dari total HPP modal (${formatRupiah(computedHpp)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && packageToEdit) {
        await packageApi.update(packageToEdit.id, {
          name,
          sell_price: numericSellPrice,
          is_active: isActive,
          items,
        });
        toast.success(`Paket "${name}" berhasil diperbarui`);
      } else {
        await packageApi.create({
          name,
          sell_price: numericSellPrice,
          items,
        });
        toast.success(`Paket "${name}" berhasil dibuat`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      toast.error('Gagal menyimpan paket', parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Layers className="w-5 h-5" />
          </div>
          <span>{isEditMode ? 'Edit Paket Bundling' : 'Buat Paket Bundling Baru'}</span>
        </div>
      }
      description="Kombinasikan beberapa menu roti menjadi satu paket hemat untuk menarik pembeli."
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <Input
          label="Nama Paket Bundling"
          placeholder="cth: Paket Sarapan Pagi Hemat"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Product Items Table Builder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Isi Produk dalam Paket ({items.length} Macam)
            </label>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 border border-dashed border-stone-200 rounded-xl text-center bg-stone-50 text-xs text-stone-500">
              Belum ada produk yang dimasukkan. Klik tombol "+ Tambah Item" di atas.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 bg-white shadow-2xs">
              {items.map((item, idx) => {
                const product = productList.find((p) => p.id === item.product_id);
                return (
                  <div key={idx} className="p-3 flex items-center gap-3 text-xs">
                    {/* Select Product */}
                    <div className="flex-1">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(idx, 'product_id', Number(e.target.value))}
                        className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
                      >
                        {productList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatRupiah(p.sell_price)}/pcs)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qty Input */}
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-lg border border-stone-300 bg-white p-2 text-center text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
                        placeholder="Qty"
                      />
                    </div>

                    {/* Subtotal preview */}
                    <div className="w-28 text-right font-mono font-medium text-stone-700">
                      {product ? formatRupiah(product.sell_price * item.quantity) : '-'}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Price & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            type="number"
            label="Harga Jual Paket (Rp)"
            placeholder="cth: 28000"
            helperText={`Harga normal terpisah: ${formatRupiah(standardSeparatePrice)}`}
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />

          {/* Analysis box */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1.5 flex flex-col justify-center">
            <div className="flex justify-between text-stone-600">
              <span>Total HPP Modal:</span>
              <span className="font-mono font-semibold text-stone-900">
                {formatRupiah(computedHpp)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimasi Laba Kotor:</span>
              <span className={`font-mono font-semibold ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatRupiah(estimatedProfit)}
              </span>
            </div>
            {estimatedSavings > 0 && (
              <div className="flex justify-between text-amber-800 font-medium">
                <span>Diskon Konsumen (Hemat):</span>
                <span>{formatRupiah(estimatedSavings)}</span>
              </div>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_package"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is_active_package" className="text-sm font-medium text-stone-700 cursor-pointer">
              Paket Aktif (Tersedia untuk Kasir)
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
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
          >
            {isEditMode ? 'Simpan Paket' : 'Buat Paket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
