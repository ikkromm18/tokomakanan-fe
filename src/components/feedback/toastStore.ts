export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  details?: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export const toastStore = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getToasts(): ToastItem[] {
    return toasts;
  },
};

export const toast = {
  success(message: string) {
    this.add('success', message);
  },
  error(message: string, details?: string) {
    this.add('error', message, details);
  },
  warning(message: string) {
    this.add('warning', message);
  },
  info(message: string) {
    this.add('info', message);
  },
  add(type: ToastType, message: string, details?: string) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, type, message, details };
    toasts = [newToast, ...toasts].slice(0, 5); // Max 5 toasts
    notify();

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 4500);
  },
  remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};
