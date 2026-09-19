import { create } from 'zustand';
import type { ThermalReceiptWidth } from '@/core/types/common';

const PRINTER_WIDTH_KEY = 'tokomakanan_thermal_width';

function getInitialWidth(): ThermalReceiptWidth {
  try {
    const val = localStorage.getItem(PRINTER_WIDTH_KEY);
    return val === '58mm' ? '58mm' : '80mm';
  } catch {
    return '80mm';
  }
}

export interface UiState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  thermalWidth: ThermalReceiptWidth;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  setThermalWidth: (width: ThermalReceiptWidth) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  thermalWidth: getInitialWidth(),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setMobileMenu: (open: boolean) => set({ mobileMenuOpen: open }),

  setThermalWidth: (width: ThermalReceiptWidth) => {
    try {
      localStorage.setItem(PRINTER_WIDTH_KEY, width);
    } catch {
      // Ignore
    }
    set({ thermalWidth: width });
  },
}));
