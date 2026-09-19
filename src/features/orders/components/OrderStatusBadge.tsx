import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/core/types/common';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusMap: Record<
    OrderStatus,
    { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
  > = {
    DRAFT: { label: 'Draft', variant: 'neutral' },
    DP_PAID: { label: 'DP Terbayar', variant: 'warning' },
    PAID: { label: 'Lunas Penuh', variant: 'success' },
    READY: { label: 'Siap Diambil', variant: 'info' },
    COMPLETED: { label: 'Selesai', variant: 'success' },
    CANCELLED: { label: 'Dibatalkan', variant: 'danger' },
  };

  const config = statusMap[status] || { label: status, variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};
