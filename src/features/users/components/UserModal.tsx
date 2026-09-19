import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/toastStore';
import { usersApi } from '../api/usersApi';
import { parseApiError } from '@/core/api/errorHandler';
import type { User } from '../types/users';

const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').optional().or(z.literal('')),
  role: z.enum(['owner', 'admin']),
  is_active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(userToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'admin',
      is_active: true,
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role === 'superadmin' ? 'admin' : (userToEdit.role as 'owner' | 'admin'),
        is_active: userToEdit.is_active,
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        is_active: true,
      });
    }
  }, [userToEdit, reset, isOpen]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode && userToEdit) {
        await usersApi.update(userToEdit.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          is_active: data.is_active,
          password: data.password || undefined,
        });
        toast.success(`Akun ${data.name} berhasil diperbarui`);
      } else {
        if (!data.password || data.password.length < 8) {
          toast.error('Validasi gagal', 'Kata sandi awal minimal 8 karakter untuk user baru');
          return;
        }
        await usersApi.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
        toast.success(`User ${data.name} berhasil dibuat`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(isEditMode ? 'Gagal mengubah user' : 'Gagal membuat user', parsed.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
      description={
        isEditMode
          ? 'Perbarui data akun atau ganti kata sandi operasional.'
          : 'Buat akun staf kasir atau owner baru untuk operasional toko.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Input
          label="Nama Lengkap"
          placeholder="cth: Sarah Kasir"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          type="email"
          label="Alamat Email (Login)"
          placeholder="kasir@tokomakanan.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Hak Akses (Role)
          </label>
          <select
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            {...register('role')}
          >
            <option value="admin">Kasir (Admin Operasional)</option>
            <option value="owner">Owner (Manajemen & Laporan)</option>
          </select>
          {errors.role && (
            <p className="text-xs text-rose-600">{errors.role.message}</p>
          )}
        </div>

        <Input
          type="password"
          label={isEditMode ? 'Ganti Kata Sandi (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal'}
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          {...register('password')}
        />

        {isEditMode && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-stone-700 cursor-pointer">
              Akun Aktif (Dapat Login ke Sistem)
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
            {isEditMode ? 'Simpan Perubahan' : 'Buat Akun'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
