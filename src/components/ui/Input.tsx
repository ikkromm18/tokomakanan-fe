import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200'
                : 'border-stone-300 focus:border-amber-600 focus:ring-amber-200',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-stone-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-600 animate-fadeIn">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-stone-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
