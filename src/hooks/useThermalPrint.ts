import { useCallback } from 'react';

/**
 * Custom hook to trigger thermal receipt printing
 */
export function useThermalPrint() {
  const print = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  return { print };
}
