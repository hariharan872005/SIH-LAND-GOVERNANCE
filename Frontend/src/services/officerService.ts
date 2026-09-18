import { Officer, GeoHierarchyScope } from '../types';
import { apiClient, ApiEnvelope } from './apiClient';

export interface CreateOfficerDto {
  fullName: string;
  employeeId?: string;
  email: string;
  phone: string;
  departmentId: string;
  designationId: string;
  roleId?: string;
  scope: GeoHierarchyScope;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateOfficerDto extends Partial<CreateOfficerDto> {
  id: string;
}

export interface OfficerFilterParams {
  search?: string;
  departmentId?: string;
  designationId?: string;
  state?: string;
  district?: string;
  status?: string;
}

function transformOfficer(raw: any): Officer {
  if (!raw) return raw;
  return {
    id: raw.id,
    fullName: raw.fullName,
    employeeId: raw.employeeId,
    email: raw.email,
    password: raw.password || 'Password@123',
    phone: raw.phone || '+91 94440 00000',
    departmentId: raw.departmentId,
    departmentName: raw.department?.name || raw.departmentName || 'Department',
    designationId: raw.designationId,
    designationTitle: raw.designation?.title || raw.designationTitle || 'Officer',
    roleId: raw.roleId || '',
    roleName: raw.role?.name || raw.roleName || 'OFFICER',
    scope: raw.scope || {
      country: 'India',
      state: raw.state?.name || raw.stateId || 'Tamil Nadu',
      district: raw.district?.name || raw.districtId || 'Chennai',
      taluk: raw.taluk?.name || raw.talukId || 'Ambattur',
      village: raw.village?.name || raw.villageId || undefined,
    },
    status: raw.status || 'ACTIVE',
    lastLogin: raw.lastLoginAt || raw.lastLogin || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export const officerService = {
  async getAll(params?: OfficerFilterParams): Promise<Officer[]> {
    const res = await apiClient.get<ApiEnvelope<any[]>>('/officers', { params });
    const list = res.data.data || [];
    return list.map(transformOfficer);
  },

  async getById(id: string): Promise<Officer | undefined> {
    const res = await apiClient.get<ApiEnvelope<any>>(`/officers/${id}`);
    return transformOfficer(res.data.data);
  },

  async create(dto: CreateOfficerDto): Promise<Officer> {
    const res = await apiClient.post<ApiEnvelope<any>>('/officers', dto);
    return transformOfficer(res.data.data);
  },

  async update(id: string, dto: Partial<CreateOfficerDto>): Promise<Officer> {
    const res = await apiClient.put<ApiEnvelope<any>>(`/officers/${id}`, dto);
    return transformOfficer(res.data.data);
  },

  async toggleStatus(id: string): Promise<Officer> {
    const res = await apiClient.patch<ApiEnvelope<any>>(`/officers/${id}/toggle-status`);
    return transformOfficer(res.data.data);
  },

  async resetAccess(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post(`/officers/${id}/reset-access`);
    return { success: true, message: res.data.message || 'Access credentials reset successfully.' };
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/officers/${id}`);
    return true;
  }
};
