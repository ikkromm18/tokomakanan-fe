export interface StoreSetting {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  receipt_footer: string | null;
  updated_at: string;
}

export interface UpdateStoreSettingRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  receipt_footer?: string | null;
}
