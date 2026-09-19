import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4 shadow-2xs">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
