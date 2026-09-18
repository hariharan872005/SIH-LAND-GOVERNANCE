import { Department } from '../types';
import { apiClient, ApiEnvelope } from './apiClient';

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
  id: string;
}

export const departmentService = {
  async getAll(): Promise<Department[]> {
    const res = await apiClient.get<ApiEnvelope<Department[]>>('/departments');
    return res.data.data;
  },

  async getById(id: string): Promise<Department | undefined> {
    const depts = await this.getAll();
    return depts.find((d) => d.id === id);
  },

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const res = await apiClient.post<ApiEnvelope<Department>>('/departments', dto);
    return res.data.data;
  },

  async update(id: string, dto: Partial<CreateDepartmentDto>): Promise<Department> {
    const res = await apiClient.put<ApiEnvelope<Department>>(`/departments/${id}`, dto);
    return res.data.data;
  },

  async toggleStatus(id: string): Promise<Department> {
    const res = await apiClient.patch<ApiEnvelope<Department>>(`/departments/${id}/toggle-status`);
    return res.data.data;
  }
};
