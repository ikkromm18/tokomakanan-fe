import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Phone, MapPin, Image, FileText, Save, Lock } from 'lucide-react';
import { settingsApi } from '../api/settingsApi';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import type { UpdateStoreSettingRequest } from '../types/settings';

const settingsSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter').max(100),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(25).optional().nullable(),
  logo_url: z.string().max(500).optional().nullable(),
  receipt_footer: z.string().max(255).optional().nullable(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const hasRole = useAuthStore((s) => s.hasRole);
  const canEdit = hasRole(['superadmin', 'owner']);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.getSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      logo_url: '',
      receipt_footer: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        logo_url: settings.logo_url || '',
        receipt_footer: settings.receipt_footer || '',
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStoreSettingRequest) =>
      settingsApi.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['store-settings'], updated);
      toast.success('Pengaturan toko berhasil disimpan');
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error('Gagal menyimpan pengaturan', parsed.message);
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  const previewFooter = useWatch({ control, name: 'receipt_footer' }) || 'Terima kasih telah berbelanja!';
  const previewName = useWatch({ control, name: 'name' }) || 'Toko Makanan';
  const previewAddress = useWatch({ control, name: 'address' }) || 'Alamat Toko';
  const previewPhone = useWatch({ control, name: 'phone' }) || '08xxxxxxxxxx';

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner text="Memuat informasi toko..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Pengaturan Toko
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Kelola profil identitas toko, kontak layanan, dan informasi nota thermal.
        </p>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Mode Hanya Baca: Anda login sebagai kasir. Hanya pemilik (Owner) dan Superadmin yang dapat mengubah pengaturan toko.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nama Toko"
                placeholder="Bakery Delights"
                leftIcon={<Store className="w-4 h-4" />}
                disabled={!canEdit}
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Telepon / WhatsApp"
                  placeholder="081234567890"
                  leftIcon={<Phone className="w-4 h-4" />}
                  disabled={!canEdit}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label="URL Logo Toko (Opsional)"
                  placeholder="https://..."
                  leftIcon={<Image className="w-4 h-4" />}
                  disabled={!canEdit}
                  error={errors.logo_url?.message}
                  {...register('logo_url')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Alamat Lengkap Toko
                </label>
                <div className="relative flex">
                  <div className="absolute left-3 top-3 pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={3}
                    disabled={!canEdit}
                    placeholder="Jl. Merdeka No. 18, Bandung"
                    className="w-full rounded-lg border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 disabled:bg-stone-100 disabled:cursor-not-allowed"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-rose-600">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Pesan Footer Struk Belanja
                </label>
                <div className="relative flex">
                  <div className="absolute left-3 top-3 pointer-events-none text-stone-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    disabled={!canEdit}
                    placeholder="Terima kasih atas kunjungan Anda! Follow IG: @bakerydelights"
                    className="w-full rounded-lg border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 disabled:bg-stone-100 disabled:cursor-not-allowed"
                    {...register('receipt_footer')}
                  />
                </div>
                <p className="text-xs text-stone-400">
                  Pesan ini akan dicetak di bagian paling bawah struk thermal belanja kasir.
                </p>
              </div>

              {canEdit && (
                <div className="pt-4 border-t border-stone-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={updateMutation.isPending}
                    disabled={!isDirty}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Right Col: Live Thermal Receipt Preview */}
        <div className="lg:col-span-1">
          <Card className="bg-amber-50/40 border-amber-200/70 sticky top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-2">
              <span>Preview Struk Thermal</span>
            </h2>

            {/* Simulated Receipt paper */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm font-mono text-xs text-stone-800 space-y-3">
              <div className="text-center border-b border-dashed border-stone-300 pb-3">
                <p className="font-bold text-sm text-stone-900">{previewName}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{previewAddress}</p>
                <p className="text-[11px] text-stone-500">Telp: {previewPhone}</p>
              </div>

              <div className="text-[11px] space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>No: INV/20260919/0001</span>
                  <span>Kasir: Sarah</span>
                </div>
                <div className="flex justify-between">
                  <span>Tgl: {new Date().toLocaleDateString('id-ID')}</span>
                  <span>14:30 WIB</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-stone-300 py-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>1x Roti Gandum</span>
                  <span>Rp 20.000</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Croissant Coklat</span>
                  <span>Rp 16.000</span>
                </div>
              </div>

              <div className="text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>TOTAL:</span>
                  <span>Rp 36.000</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>BAYAR (TUNAI):</span>
                  <span>Rp 50.000</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>KEMBALIAN:</span>
                  <span>Rp 14.000</span>
                </div>
              </div>

              <div className="border-t border-dashed border-stone-300 pt-3 text-center text-[10px] text-stone-600 italic">
                {previewFooter}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
