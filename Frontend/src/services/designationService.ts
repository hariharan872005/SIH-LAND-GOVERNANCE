import { Designation } from '../types';
import { apiClient, ApiEnvelope } from './apiClient';

export interface CreateDesignationDto {
  title: string;
  code: string;
  departmentId: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDesignationDto extends Partial<CreateDesignationDto> {
  id: string;
}

export const designationService = {
  async getAll(): Promise<Designation[]> {
    const res = await apiClient.get<ApiEnvelope<Designation[]>>('/designations');
    return res.data.data;
  },

  async getByDepartment(deptId: string): Promise<Designation[]> {
    const res = await apiClient.get<ApiEnvelope<Designation[]>>('/designations', {
      params: { departmentId: deptId },
    });
    return res.data.data;
  },

  async create(dto: CreateDesignationDto): Promise<Designation> {
    const res = await apiClient.post<ApiEnvelope<Designation>>('/designations', dto);
    return res.data.data;
  },

  async update(id: string, dto: Partial<CreateDesignationDto>): Promise<Designation> {
    const res = await apiClient.put<ApiEnvelope<Designation>>(`/designations/${id}`, dto);
    return res.data.data;
  },

  async toggleStatus(id: string): Promise<Designation> {
    const res = await apiClient.patch<ApiEnvelope<Designation>>(`/designations/${id}/toggle-status`);
    return res.data.data;
  }
};
