import { useCallback } from 'react';
import { printReceiptElement } from '@/utils/printReceipt';
import { useUiStore } from '@/stores/uiStore';

/**
 * Custom hook to trigger thermal receipt printing
 */
export function useThermalPrint() {
  const { thermalWidth } = useUiStore();

  const printReceipt = useCallback(
    (element: HTMLElement | null, title?: string) => {
      if (!element) {
        if (typeof window !== 'undefined') {
          window.print();
        }
        return Promise.resolve();
      }
      return printReceiptElement(element, { thermalWidth, title });
    },
    [thermalWidth]
  );

  const print = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  return { print, printReceipt, thermalWidth };
}
