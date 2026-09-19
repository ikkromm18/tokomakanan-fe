import type { BaseQueryParams } from '@/core/types/api';

export interface PackageItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_hpp: number | null; // null for admin role
  unit_sell: number;
}

export interface Package {
  id: number;
  name: string;
  total_hpp: number | null; // null for admin role
  sell_price: number;
  is_active: boolean;
  items: PackageItem[];
  created_at: string;
  updated_at: string;
}

export interface PackageItemInput {
  product_id: number;
  quantity: number;
}

export interface CreatePackageRequest {
  name: string;
  sell_price: number;
  items: PackageItemInput[];
}

export interface UpdatePackageRequest {
  name?: string;
  sell_price?: number;
  is_active?: boolean;
  items?: PackageItemInput[];
}

export interface PackageQueryParams extends BaseQueryParams {
  is_active?: boolean | '';
}
