import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast, toastStore, type ToastItem } from './toastStore';

export const ToastContainer: React.FC = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>(toastStore.getToasts());

  useEffect(() => {
    return toastStore.subscribe(setCurrentToasts);
  }, []);

  if (currentToasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borderVariants = {
    success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-500/5',
    error: 'border-rose-200 bg-white shadow-lg shadow-rose-500/5',
    warning: 'border-amber-200 bg-white shadow-lg shadow-amber-500/5',
    info: 'border-sky-200 bg-white shadow-lg shadow-sky-500/5',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {currentToasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border text-stone-800 transition-all transform animate-slideUp duration-200',
            borderVariants[item.type]
          )}
        >
          {icons[item.type]}
          <div className="flex-1 text-xs">
            <p className="font-semibold text-stone-900 leading-tight">{item.message}</p>
            {item.details && (
              <p className="mt-1 text-stone-500 line-clamp-2 leading-relaxed font-mono text-[11px]">
                {item.details}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => toast.remove(item.id)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
