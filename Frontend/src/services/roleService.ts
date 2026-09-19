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
    const res = await apiClient.get<ApiEnvelope<any[]>>('/roles');
    const roles = Array.isArray(res.data?.data) ? res.data.data : [];
    return roles.map((r: any) => {
      const permissionCodes: PermissionCode[] = Array.isArray(r.permissions)
        ? r.permissions.map((p: any) =>
            typeof p === 'object' && p !== null ? (p.code || p.name || '') : String(p)
          ).filter(Boolean)
        : [];

      return {
        id: r.id,
        name: r.name || 'Unnamed Role',
        departmentId: r.departmentId || '',
        departmentName:
          r.department?.name ||
          r.departmentName ||
          (r.isSystemRole ? 'System Wide / All Departments' : 'General'),
        designationId: r.designationId || '',
        designationTitle: r.designationTitle || r.designation?.title || '',
        description:
          r.description ||
          (r.isSystemRole ? 'System-defined governance access policy' : 'Departmental RBAC clearance policy'),
        permissions: permissionCodes,
        isSystemRole: Boolean(r.isSystemRole),
        officerCount: Number(r.officerCount ?? (Array.isArray(r.officers) ? r.officers.length : 0)),
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      };
    });
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
    try {
      const res = await apiClient.get<ApiEnvelope<any[]>>('/permissions');
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return res.data.data.map((p: any) => ({
          id: p.id || p.code,
          code: p.code,
          name: p.name || p.code,
          category: p.category || 'SYSTEM',
          description: p.description || `${p.name || p.code} authorization capability`,
        }));
      }
    } catch {
      // fallback to static constants
    }
    return ALL_PERMISSIONS;
  },

  async getByCategory(category: Permission['category']): Promise<Permission[]> {
    const all = await this.getAll();
    return all.filter((p) => p.category === category);
  }
};
