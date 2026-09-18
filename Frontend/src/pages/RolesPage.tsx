import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ShieldCheck, 
  Plus, 
  KeyRound, 
  Users, 
  Building2, 
  Check, 
  ShieldAlert 
} from 'lucide-react';
import { 
  useRoles, 
  useDepartments, 
  useDesignations, 
  usePermissions, 
  useCreateRole 
} from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Role, PermissionCode } from '../types';
import { roleSchema, RoleFormData } from '../schemas';
import { useToast } from '../hooks/useToast';

export const RolesPage: React.FC = () => {
  const { data: roles, isLoading } = useRoles();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: permissions } = usePermissions();
  const { success, error: toastError } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const createMutation = useCreateRole();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      permissions: [],
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const filteredDesignations = (designations || []).filter(
    (d) => !selectedDepartmentId || d.departmentId === selectedDepartmentId
  );

  const filteredRoles = (roles || []).filter((r) => {
    if (departmentFilter === 'ALL') return true;
    return r.departmentId === departmentFilter;
  });

  const openCreateModal = () => {
    setSelectedPermissions([]);
    reset({
      name: '',
      departmentId: departments?.[0]?.id || '',
      description: '',
      permissions: [],
    });
    setIsCreateModalOpen(true);
  };

  const togglePermission = (code: string) => {
    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    if (selectedPermissions.length === 0) {
      toastError('Permissions Required', 'Please check at least one permission capability.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: data.name,
        departmentId: data.departmentId,
        designationId: data.designationId || '',
        description: data.description,
        permissions: selectedPermissions as PermissionCode[],
      });
      success('Role Policy Registered', `Role ${data.name} created with ${selectedPermissions.length} permissions.`);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toastError('Creation Failed', err.message);
    }
  };

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Role Title & Policy',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-500 max-w-sm truncate">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department Binding',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          {row.departmentName}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions Assigned',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {row.permissions.slice(0, 3).map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-mono"
            >
              {p}
            </span>
          ))}
          {row.permissions.length > 3 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
              +{row.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'officerCount',
      header: 'Assigned Officers',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-mono">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.officerCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created On',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Access Control' }, { label: 'Role Policies' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department → Designation → Role → Granular Verification Capabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Role</span>
        </button>
      </div>

      {/* Table & Department Filter */}
      <DataTable
        data={filteredRoles}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search roles..."
        exportFileName="rbac_roles"
        filterSlot={
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">All Departments</option>
            {(departments || []).map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Define Departmental RBAC Role"
        subtitle="Specify official authorization boundaries and verification capabilities."
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Role Name *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Revenue Tahsildar Verifier"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Department *
              </label>
              <select
                {...register('departmentId')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                {(departments || []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Role Functional Description *
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Outline the official clearance responsibilities..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Granular Permission Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Granular Permissions ({selectedPermissions.length} selected):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">RBAC Security Matrix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {(permissions || []).map((p) => {
                const isSelected = selectedPermissions.includes(p.code);
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePermission(p.code)}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-100 border-black shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-black border-black text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.code}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Register Role Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
