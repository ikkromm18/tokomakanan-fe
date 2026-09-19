import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuantityInputProps {
  value: number;
  onChange: (quantity: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  min = 1,
  max = 9999,
  disabled = false,
}) => {
  const [inputVal, setInputVal] = useState<string>(String(value));

  // Sync external value changes (e.g. from increment / decrement / store updates)
  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty while user is actively typing / backspacing
    if (raw === '') {
      setInputVal('');
      return;
    }

    // Only allow whole digits
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      setInputVal('');
      return;
    }

    const parsed = parseInt(cleaned, 10);
    const clamped = Math.min(max, parsed);
    setInputVal(String(clamped));

    if (clamped >= min) {
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < min) {
      setInputVal(String(min));
      onChange(min);
    } else if (parsed > max) {
      setInputVal(String(max));
      onChange(max);
    } else {
      setInputVal(String(parsed));
      onChange(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center gap-0.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label="Kurangi kuantitas"
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Minus className="w-3 h-3" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputVal}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        aria-label="Jumlah pesanan"
        className="w-12 text-center text-xs font-bold font-mono text-stone-900 bg-transparent border-none focus:outline-none focus:bg-amber-50/50 focus:ring-1 focus:ring-amber-500 rounded py-0.5 transition-all select-all"
      />

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label="Tambah kuantitas"
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
