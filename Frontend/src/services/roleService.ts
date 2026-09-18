import { Role, Permission, PermissionCode } from '../types';
import { apiClient, ApiEnvelope } from './apiClient';
import { ALL_PERMISSIONS } from '../constants/permissions';

export interface CreateRoleDto {
  name: string;
  departmentId: string;
  designationId?: string;
  designationTitle?: string;
  description: string;
  permissions: PermissionCode[];
}

export const roleService = {
  async getAll(): Promise<Role[]> {
    const res = await apiClient.get<ApiEnvelope<Role[]>>('/roles');
    return res.data.data;
  },

  async getById(id: string): Promise<Role | undefined> {
    const roles = await this.getAll();
    return roles.find((r) => r.id === id);
  },

  async create(dto: CreateRoleDto): Promise<Role> {
    const res = await apiClient.post<ApiEnvelope<Role>>('/roles', dto);
    return res.data.data;
  },

  async update(id: string, dto: Partial<CreateRoleDto>): Promise<Role> {
    const res = await apiClient.put<ApiEnvelope<Role>>(`/roles/${id}`, dto);
    return res.data.data;
  }
};

export const permissionService = {
  async getAll(): Promise<Permission[]> {
    return ALL_PERMISSIONS;
  },

  async getByCategory(category: Permission['category']): Promise<Permission[]> {
    return ALL_PERMISSIONS.filter((p) => p.category === category);
  }
};
