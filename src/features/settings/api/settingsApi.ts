import { apiClient } from '@/core/api/client';
import type { StoreSetting, UpdateStoreSettingRequest } from '../types/settings';

export const settingsApi = {
  async getSettings(): Promise<StoreSetting> {
    return apiClient.get<StoreSetting>('/store-settings');
  },

  async updateSettings(payload: UpdateStoreSettingRequest): Promise<StoreSetting> {
    return apiClient.put<StoreSetting>('/store-settings', payload);
  },
};
