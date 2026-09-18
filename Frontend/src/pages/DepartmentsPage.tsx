import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Users,
  Briefcase
} from 'lucide-react';
import { 
  useDepartments, 
  useCreateDepartment, 
  useUpdateDepartment, 
  useToggleDepartmentStatus 
} from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Department } from '../types';
import { departmentSchema, DepartmentFormData } from '../schemas';
import { useToast } from '../hooks/useToast';

export const DepartmentsPage: React.FC = () => {
  const { data: departments, isLoading } = useDepartments();
  const { success, error: toastError } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<Department | null>(null);

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const toggleStatusMutation = useToggleDepartmentStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const openCreateModal = () => {
    setEditingDepartment(null);
    reset({
      name: '',
      code: '',
      description: '',
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    reset({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      status: dept.status,
    });
    setIsCreateModalOpen(true);
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        await updateMutation.mutateAsync({
          id: editingDepartment.id,
          dto: data,
        });
        success('Department Updated', `${data.name} has been updated successfully.`);
      } else {
        await createMutation.mutateAsync(data as any);
        success('Department Created', `${data.name} has been added to the registry.`);
      }
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toastError('Operation Failed', err.message || 'Unable to save department.');
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirmTarget) return;
    try {
      await toggleStatusMutation.mutateAsync(statusConfirmTarget.id);
      success(
        'Status Updated',
        `Department ${statusConfirmTarget.name} is now ${
          statusConfirmTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }.`
      );
      setStatusConfirmTarget(null);
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            {row.description && (
              <p className="text-[11px] text-slate-500 truncate max-w-sm">{row.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 font-bold">
          {row.code}
        </span>
      ),
    },
    {
      key: 'designationCount',
      header: 'Designations',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-mono">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          {row.designationCount}
        </span>
      ),
    },
    {
      key: 'officerCount',
      header: 'Officers',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-mono">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.officerCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            title="Edit Department"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setStatusConfirmTarget(row)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              row.status === 'ACTIVE'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Organization' }, { label: 'Departments' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Departments Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure land governance departments, manage verification authority silos, and scale departmental hierarchy.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Table */}
      <DataTable
        data={departments || []}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search departments by name or code..."
        exportFileName="departments_registry"
      />

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingDepartment ? 'Edit Department' : 'Create New Department'}
        subtitle="Manage land governance verification authority structure."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Survey & Land Records"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Department Code *
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder="e.g. SUR-LR"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black uppercase"
            />
            {errors.code && <p className="text-[11px] text-rose-600 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Functional Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Brief description of the jurisdiction and responsibilities..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Initial Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
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
              {isSubmitting ? 'Saving...' : editingDepartment ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Toggle Status */}
      <ConfirmDialog
        isOpen={Boolean(statusConfirmTarget)}
        onClose={() => setStatusConfirmTarget(null)}
        onConfirm={handleToggleStatus}
        title={`${statusConfirmTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Department`}
        message={`Are you sure you want to ${
          statusConfirmTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } "${statusConfirmTarget?.name}"?`}
        variant={statusConfirmTarget?.status === 'ACTIVE' ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};
