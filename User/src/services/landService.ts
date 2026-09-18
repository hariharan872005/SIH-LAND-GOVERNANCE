import { apiClient, ApiEnvelope } from './apiClient';
import { LandParcel } from '../types';

export interface LandFilterParams {
  search?: string;
  status?: string;
  landType?: string;
  stateId?: string;
  districtId?: string;
  talukId?: string;
  villageId?: string;
  page?: number;
  pageSize?: number;
}

export const landService = {
  async getAllParcels(params?: LandFilterParams): Promise<LandParcel[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<LandParcel[]>>('/lands', {
        params: {
          page: params?.page || 1,
          pageSize: Math.min(params?.pageSize || 200, 200),
          search: params?.search || undefined,
          status: params?.status === 'ALL' ? undefined : params?.status,
          landType: params?.landType === 'ALL' ? undefined : params?.landType,
          stateId: params?.stateId === 'ALL' ? undefined : params?.stateId,
          districtId: params?.districtId === 'ALL' ? undefined : params?.districtId,
          talukId: params?.talukId === 'ALL' ? undefined : params?.talukId,
          villageId: params?.villageId === 'ALL' ? undefined : params?.villageId,
        },
      });
      return response.data?.data || [];
    } catch (err) {
      console.error('Error loading parcels from backend:', err);
      return [];
    }
  },

  async getParcelById(landId: string): Promise<LandParcel> {
    const response = await apiClient.get<ApiEnvelope<LandParcel>>(`/lands/${encodeURIComponent(landId)}`);
    return response.data.data;
  },
};
