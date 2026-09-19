import type { BaseQueryParams } from '@/core/types/api';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address?: string | null;
}

export interface UpdateCustomerRequest {
  name: string;
  phone: string;
  address?: string | null;
}

export type CustomerQueryParams = BaseQueryParams;
