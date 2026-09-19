/**
 * System-wide business enums and shared common types
 */
export type UserRole = 'superadmin' | 'owner' | 'admin';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS';

export type OrderType = 'DIRECT_SALE' | 'PRE_ORDER';

export type OrderStatus =
  | 'DRAFT'
  | 'DP_PAID'
  | 'PAID'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type ItemType = 'PRODUCT' | 'PACKAGE';

export type ThermalReceiptWidth = '80mm' | '58mm';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}
