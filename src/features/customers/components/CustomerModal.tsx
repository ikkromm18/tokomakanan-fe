import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/toastStore';
import { customerApi } from '../api/customerApi';
import { parseApiError } from '@/core/api/errorHandler';
import type { Customer } from '../types/customer';

const customerSchema = z.object({
  name: z.string().min(2, 'Nama pelanggan minimal 2 karakter').max(100),
  phone: z
    .string()
    .min(8, 'Nomor telepon minimal 8 digit')
    .max(20, 'Nomor telepon maksimal 20 digit')
    .regex(/^[0-9+\-\s]+$/, 'Format nomor telepon tidak valid'),
  address: z.string().max(255).optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSuccess: (customer?: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(customerToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      reset({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
        address: customerToEdit.address || '',
      });
    } else {
      reset({
        name: '',
        phone: '',
        address: '',
      });
    }
  }, [customerToEdit, reset, isOpen]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditMode && customerToEdit) {
        const updated = await customerApi.update(customerToEdit.id, {
          name: data.name,
          phone: data.phone,
          address: data.address || undefined,
        });
        toast.success(`Data pelanggan "${data.name}" berhasil diperbarui`);
        onSuccess(updated);
      } else {
        const created = await customerApi.create({
          name: data.name,
          phone: data.phone,
          address: data.address || undefined,
        });
        toast.success(`Pelanggan "${data.name}" berhasil didaftarkan`);
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(isEditMode ? 'Gagal mengubah pelanggan' : 'Gagal mendaftar pelanggan', parsed.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Pelanggan' : 'Daftar Pelanggan Baru'}
      description="Data nomor WhatsApp pelanggan digunakan untuk mengirimkan tautan nota digital."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Input
          label="Nama Pelanggan"
          placeholder="cth: Ibu Kartika"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Nomor WhatsApp / Telepon"
          placeholder="cth: 081987654321"
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Wajib diisi untuk pengiriman nota digital & pesanan PO"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Alamat Pengantaran / Domisili (Opsional)
          </label>
          <div className="relative flex">
            <div className="absolute left-3 top-3 pointer-events-none text-stone-400">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea
              rows={2}
              placeholder="cth: Komplek Dago Asri No. 12, Bandung"
              className="w-full rounded-lg border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              {...register('address')}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-rose-600">{errors.address.message}</p>
          )}
        </div>

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
            {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
