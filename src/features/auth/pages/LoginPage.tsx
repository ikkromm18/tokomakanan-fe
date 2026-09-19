import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Store, AlertCircle, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/pos';

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login(data);
      setAuth(response.token, response.user);
      toast.success(`Selamat datang kembali, ${response.user.name}!`);

      // Redirect kasir to /pos, owner to /dashboard or requested path
      navigate(fromPath, { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMessage(parsed.message);
      toast.error('Gagal masuk', parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-stone-100/70 p-4 sm:p-6 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/20 mb-3.5">
            <Store className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Toko Makanan
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Bakery POS & Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-stone-200/40">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-stone-900">Masuk ke Sistem</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Masukkan email dan kata sandi operasional Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-700 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              label="Alamat Email"
              placeholder="nama@tokomakanan.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              type="password"
              label="Kata Sandi"
              placeholder="Minimal 8 karakter"
              autoComplete="current-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
              Akun Cepat (Development / Demo)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  fillQuickCredentials('superadmin@tokomakanan.com', 'SuperAdmin123!')
                }
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-stone-700 font-medium transition-all cursor-pointer"
              >
                Superadmin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillQuickCredentials('budi.owner@tokomakanan.com', 'Password123!')
                }
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-stone-700 font-medium transition-all cursor-pointer"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() =>
                  fillQuickCredentials('kasir1@tokomakanan.com', 'Password123!')
                }
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-stone-700 font-medium transition-all cursor-pointer"
              >
                Kasir
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-stone-400">
          &copy; {new Date().getFullYear()} Toko Makanan. Dilindungi hak cipta.
        </p>
      </div>
    </div>
  );
};
