import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Users,
  Building2 
} from 'lucide-react';
import { 
  useDesignations, 
  useDepartments, 
  useCreateDesignation, 
  useUpdateDesignation 
} from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Designation } from '../types';
import { designationSchema, DesignationFormData } from '../schemas';
import { useToast } from '../hooks/useToast';

export const DesignationsPage: React.FC = () => {
  const { data: designations, isLoading } = useDesignations();
  const { data: departments } = useDepartments();
  const { success, error: toastError } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesignationFormData>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const filteredDesignations = (designations || []).filter((d) => {
    if (departmentFilter === 'ALL') return true;
    return d.departmentId === departmentFilter;
  });

  const openCreateModal = () => {
    setEditingDesignation(null);
    reset({
      title: '',
      code: '',
      departmentId: departments?.[0]?.id || '',
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (desig: Designation) => {
    setEditingDesignation(desig);
    reset({
      title: desig.title,
      code: desig.code,
      departmentId: desig.departmentId,
      status: desig.status,
    });
    setIsCreateModalOpen(true);
  };

  const onSubmit = async (data: DesignationFormData) => {
    try {
      if (editingDesignation) {
        await updateMutation.mutateAsync({
          id: editingDesignation.id,
          dto: data,
        });
        success('Designation Updated', `${data.title} has been updated.`);
      } else {
        await createMutation.mutateAsync(data as any);
        success('Designation Created', `${data.title} has been created successfully.`);
      }
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toastError('Operation Failed', err.message);
    }
  };

  const columns: Column<Designation>[] = [
    {
      key: 'title',
      header: 'Designation Title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.title}</p>
            <p className="text-[11px] text-slate-500 font-mono">Code: {row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Assigned Department',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-800 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          {row.departmentName}
        </span>
      ),
    },
    {
      key: 'officerCount',
      header: 'Active Officers',
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
      header: 'Added On',
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
        <button
          type="button"
          onClick={() => openEditModal(row)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
          title="Edit Designation"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Organization' }, { label: 'Designations' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Designations Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardize official roles such as Tahsildar, Cadastral Surveyor, Sub-Registrar, and Municipal Revenue Inspectors.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Designation</span>
        </button>
      </div>

      {/* Table & Department Filter */}
      <DataTable
        data={filteredDesignations}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search designations by title or code..."
        exportFileName="designations_registry"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingDesignation ? 'Edit Designation' : 'Create New Designation'}
        subtitle="Bind official titles to verification departments."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Designation Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Sub-Registrar (Registration & Stamps)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Designation Code *
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder="e.g. SRO"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black uppercase"
            />
            {errors.code && <p className="text-[11px] text-rose-600 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Parent Department *
            </label>
            <select
              {...register('departmentId')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {(departments || []).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.departmentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status
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
              {isSubmitting ? 'Saving...' : editingDesignation ? 'Update Designation' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
