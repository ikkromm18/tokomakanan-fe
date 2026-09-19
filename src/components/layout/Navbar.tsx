import React, { useState } from 'react';
import { Menu, LogOut, KeyRound, Printer } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { Badge } from '@/components/ui/Badge';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import type { UserRole, ThermalReceiptWidth } from '@/core/types/common';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setMobileMenu, thermalWidth, setThermalWidth } = useUiStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const roleBadges: Record<UserRole, { label: string; variant: 'danger' | 'info' | 'success' }> = {
    superadmin: { label: 'Superadmin', variant: 'danger' },
    owner: { label: 'Owner', variant: 'info' },
    admin: { label: 'Kasir', variant: 'success' },
  };

  const currentRole = user?.role || 'admin';
  const roleInfo = roleBadges[currentRole];

  const handleToggleThermal = () => {
    const nextWidth: ThermalReceiptWidth = thermalWidth === '80mm' ? '58mm' : '80mm';
    setThermalWidth(nextWidth);
  };

  return (
    <>
      <header className="no-print h-16 shrink-0 border-b border-stone-200/80 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        {/* Left: Mobile hamburger & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              Operasional Aktif
            </span>
          </div>
        </div>

        {/* Right: Actions, Printer mode & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Printer format toggle */}
          <button
            type="button"
            onClick={handleToggleThermal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700 text-xs font-medium transition-colors cursor-pointer"
            title="Ubah lebar kertas nota default (80mm / 58mm)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="font-mono font-semibold">{thermalWidth}</span>
          </button>

          {/* User Profile display */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-bold text-stone-900 truncate max-w-[140px]">
                {user?.name || 'Kasir'}
              </p>
              <div className="mt-0.5">
                <Badge variant={roleInfo.variant} size="sm">
                  {roleInfo.label}
                </Badge>
              </div>
            </div>

            {/* Change Password button */}
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Ubah kata sandi"
              aria-label="Ubah kata sandi"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Keluar akun"
              aria-label="Keluar akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
