import { apiClient, ApiEnvelope } from './apiClient';
import { LandParcel } from '../types';

export const searchService = {
  async searchParcels(query: string): Promise<LandParcel[]> {
    if (!query || query.trim().length < 1) return [];
    const response = await apiClient.get<ApiEnvelope<LandParcel[]>>('/lands', {
      params: {
        search: query.trim(),
        pageSize: 20,
      },
    });
    return response.data.data;
  },
};
