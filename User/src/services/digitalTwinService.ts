import { apiClient, ApiEnvelope } from './apiClient';
import { DigitalTwinDetail } from '../types';

export const digitalTwinService = {
  async getDigitalTwinByLandId(landId: string): Promise<DigitalTwinDetail | any> {
    const response = await apiClient.get<ApiEnvelope<any>>(
      `/digital-twins/${encodeURIComponent(landId)}`
    );
    return response.data?.data;
  },
};
