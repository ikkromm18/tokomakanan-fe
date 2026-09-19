import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/toastStore';
import { authApi } from '../api/authApi';
import { parseApiError } from '@/core/api/errorHandler';
import { Lock } from 'lucide-react';

const changePasswordSchema = z
  .object({
    old_password: z.string().min(8, 'Kata sandi lama minimal 8 karakter'),
    new_password: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
    confirm_password: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
    path: ['confirm_password'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.changePassword(data);
      toast.success('Kata sandi berhasil diperbarui');
      reset();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error('Gagal memperbarui kata sandi', parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Lock className="w-5 h-5" />
          </div>
          <span>Ubah Kata Sandi</span>
        </div>
      }
      description="Pastikan kata sandi baru Anda aman dan memiliki minimal 8 karakter."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Input
          type="password"
          label="Kata Sandi Lama"
          placeholder="••••••••"
          error={errors.old_password?.message}
          {...register('old_password')}
        />

        <Input
          type="password"
          label="Kata Sandi Baru"
          placeholder="••••••••"
          error={errors.new_password?.message}
          {...register('new_password')}
        />

        <Input
          type="password"
          label="Konfirmasi Kata Sandi Baru"
          placeholder="••••••••"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
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
            Simpan Kata Sandi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
