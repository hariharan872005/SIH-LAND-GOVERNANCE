import { apiClient, ApiEnvelope } from './apiClient';
import { LocationState, LocationDistrict, LocationTaluk, LocationVillage } from '../types';

export const locationService = {
  async getStates(): Promise<LocationState[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<LocationState[]>>('/administrative-scope/states');
      return response.data.data;
    } catch {
      return [{ id: 'state_tn', name: 'Tamil Nadu', code: 'TN' }];
    }
  },

  async getDistricts(stateId: string): Promise<LocationDistrict[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<LocationDistrict[]>>(
        `/administrative-scope/states/${encodeURIComponent(stateId)}/districts`
      );
      return response.data.data;
    } catch {
      return [{ id: 'dist_che', name: 'Chennai', stateId: 'state_tn' }];
    }
  },

  async getTaluks(districtId: string): Promise<LocationTaluk[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<LocationTaluk[]>>(
        `/administrative-scope/districts/${encodeURIComponent(districtId)}/taluks`
      );
      return response.data.data;
    } catch {
      return [{ id: 'taluk_amb', name: 'Ambattur', districtId: 'dist_che' }];
    }
  },

  async getVillages(talukId: string): Promise<LocationVillage[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<LocationVillage[]>>(
        `/administrative-scope/taluks/${encodeURIComponent(talukId)}/villages`
      );
      return response.data.data;
    } catch {
      return [
        { id: 'vil_amb_ot', name: 'Ambattur OT', talukId: 'taluk_amb' },
        { id: 'vil_padi', name: 'Padi Industrial', talukId: 'taluk_amb' },
      ];
    }
  },
};
