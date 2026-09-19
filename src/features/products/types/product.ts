import type { BaseQueryParams } from '@/core/types/api';

export interface Product {
  id: number;
  name: string;
  category: string;
  hpp: number | null; // null for admin (kasir) role
  sell_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  hpp: number;
  sell_price: number;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  hpp?: number;
  sell_price?: number;
  is_active?: boolean;
}

export interface ProductQueryParams extends BaseQueryParams {
  category?: string;
  is_active?: boolean | '';
}
