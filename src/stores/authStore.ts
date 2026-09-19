import { create } from 'zustand';
import { tokenStorage } from '@/core/security/tokenStorage';
import { AUTH_UNAUTHORIZED_EVENT } from '@/core/api/client';
import { toast } from '@/components/feedback/toastStore';
import type { UserRole, UserSummary } from '@/core/types/common';

const USER_KEY = 'tokomakanan_user_info';

function getStoredUser(): UserSummary | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface AuthState {
  token: string | null;
  user: UserSummary | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserSummary) => void;
  setUser: (user: UserSummary) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: tokenStorage.getToken(),
  user: getStoredUser(),
  isAuthenticated: Boolean(tokenStorage.getToken()),

  setAuth: (token: string, user: UserSummary) => {
    tokenStorage.setToken(token);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user: UserSummary) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
    set({ user });
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  },

  logout: () => {
    tokenStorage.removeToken();
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage errors
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

// Listen for 401 unauthorized events broadcast by apiClient
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (isAuth) {
      useAuthStore.getState().logout();
      toast.warning('Sesi login Anda telah berakhir. Silakan login kembali.');
    }
  });
}
