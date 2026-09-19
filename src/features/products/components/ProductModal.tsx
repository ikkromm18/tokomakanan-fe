import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/toastStore';
import { productApi } from '../api/productApi';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import type { Product } from '../types/product';

const productSchema = z
  .object({
    name: z.string().min(2, 'Nama produk minimal 2 karakter').max(150),
    category: z.string().min(2, 'Kategori minimal 2 karakter').max(50),
    hpp: z.coerce.number().min(1, 'HPP modal harus lebih dari 0'),
    sell_price: z.coerce.number().min(1, 'Harga jual harus lebih dari 0'),
    is_active: z.boolean(),
  })
  .refine((data) => data.sell_price >= data.hpp, {
    message: 'Harga jual harus lebih besar atau sama dengan HPP modal',
    path: ['sell_price'],
  });

type ProductFormData = z.infer<typeof productSchema>;

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(productToEdit);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      hpp: 0,
      sell_price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (productToEdit) {
      reset({
        name: productToEdit.name,
        category: productToEdit.category,
        hpp: productToEdit.hpp || 0,
        sell_price: productToEdit.sell_price,
        is_active: productToEdit.is_active,
      });
    } else {
      reset({
        name: '',
        category: '',
        hpp: 0,
        sell_price: 0,
        is_active: true,
      });
    }
  }, [productToEdit, reset, isOpen]);

  const watchedHpp = useWatch({ control, name: 'hpp' }) || 0;
  const watchedSellPrice = useWatch({ control, name: 'sell_price' }) || 0;
  const estimatedProfit = watchedSellPrice - watchedHpp;
  const marginPct =
    watchedSellPrice > 0
      ? Math.round((estimatedProfit / watchedSellPrice) * 100)
      : 0;

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode && productToEdit) {
        await productApi.update(productToEdit.id, {
          name: data.name,
          category: data.category,
          hpp: data.hpp,
          sell_price: data.sell_price,
          is_active: data.is_active,
        });
        toast.success(`Produk "${data.name}" berhasil diperbarui`);
      } else {
        await productApi.create({
          name: data.name,
          category: data.category,
          hpp: data.hpp,
          sell_price: data.sell_price,
        });
        toast.success(`Produk "${data.name}" berhasil ditambahkan`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(isEditMode ? 'Gagal mengubah produk' : 'Gagal membuat produk', parsed.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Produk' : 'Tambah Produk Baru'}
      description="Kelola informasi menu roti, harga pokok penjualan (HPP), dan harga jual ke pelanggan."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Input
          label="Nama Produk"
          placeholder="cth: Roti Tawar Gandum"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Kategori
          </label>
          <input
            list="category-suggestions"
            placeholder="cth: Bakery, Pastry, Cake, Roti Manis"
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            {...register('category')}
          />
          <datalist id="category-suggestions">
            <option value="Roti Manis" />
            <option value="Roti Tawar" />
            <option value="Pastry" />
            <option value="Cake" />
            <option value="Kue Kering" />
            <option value="Minuman" />
          </datalist>
          {errors.category && (
            <p className="text-xs text-rose-600">{errors.category.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="HPP Modal (Rp)"
            placeholder="cth: 12000"
            helperText="Harga modal per satu porsi/pcs"
            error={errors.hpp?.message}
            {...register('hpp')}
          />

          <Input
            type="number"
            label="Harga Jual (Rp)"
            placeholder="cth: 20000"
            helperText="Harga yang dibayar pembeli"
            error={errors.sell_price?.message}
            {...register('sell_price')}
          />
        </div>

        {/* Live Profit Preview Box */}
        {watchedSellPrice > 0 && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Estimasi Laba Kotor per Pcs:</span>
              <span
                className={`font-semibold ${
                  estimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatRupiah(estimatedProfit)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Margin Keuntungan:</span>
              <span className="font-semibold text-stone-900">
                {marginPct}%
              </span>
            </div>
          </div>
        )}

        {isEditMode && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_product"
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              {...register('is_active')}
            />
            <label
              htmlFor="is_active_product"
              className="text-sm font-medium text-stone-700 cursor-pointer"
            >
              Produk Aktif (Tersedia untuk Transaksi Kasir)
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
            {isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
