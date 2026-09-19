import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingBag,
  ReceiptText,
  UtensilsCrossed,
  PackagePlus,
  Users,
  LayoutDashboard,
  BarChart3,
  UserCog,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/core/types/common';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Kasir (POS)',
    path: '/pos',
    icon: <ShoppingBag className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Pesanan',
    path: '/orders',
    icon: <ReceiptText className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Master Produk',
    path: '/products',
    icon: <UtensilsCrossed className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Paket Bundling',
    path: '/packages',
    icon: <PackagePlus className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Pelanggan',
    path: '/customers',
    icon: <Users className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  },
  {
    label: 'Laporan Keuangan',
    path: '/reports',
    icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    allowedRoles: ['superadmin', 'owner'],
  },
  {
    label: 'Manajemen User',
    path: '/users',
    icon: <UserCog className="w-5 h-5 shrink-0" />,
    allowedRoles: ['superadmin'],
  },
  {
    label: 'Pengaturan Toko',
    path: '/settings',
    icon: <Settings className="w-5 h-5 shrink-0" />,
  },
];

export const Sidebar: React.FC = () => {
  const hasRole = useAuthStore((s) => s.hasRole);
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenu } =
    useUiStore();

  const filteredItems = navItems.filter(
    (item) => !item.allowedRoles || hasRole(item.allowedRoles)
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-stone-900 text-stone-300">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-stone-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
              <Store className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="leading-none truncate">
                <span className="text-base font-bold text-white tracking-tight">
                  Toko Makanan
                </span>
                <span className="block text-[11px] font-medium text-amber-400 mt-1">
                  POS & Management
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group select-none',
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/80',
                  sidebarCollapsed && 'justify-center px-2.5'
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Collapse Desktop Toggle */}
      <div className="hidden md:block p-3 border-t border-stone-800">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Ciutkan Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'no-print hidden md:block shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 md:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenu(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
