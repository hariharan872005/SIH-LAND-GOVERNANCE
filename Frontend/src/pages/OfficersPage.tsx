import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Key, 
  Building2, 
  Briefcase, 
  UserCheck, 
  Mail, 
  Phone,
  Layers,
  History,
  Eye,
  EyeOff,
  Copy,
  Lock,
  Trash2
} from 'lucide-react';
import { 
  useOfficers, 
  useDepartments, 
  useDesignations, 
  useRoles, 
  useCreateOfficer, 
  useUpdateOfficer, 
  useResetOfficerAccess,
  useDeleteOfficer,
  useOfficerActivityLogs
} from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge, ScopeBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Officer } from '../types';
import { officerSchema, OfficerFormData } from '../schemas';
import { ALL_STATES, getDistrictsForState, getTaluksForDistrict, getVillagesForTaluk } from '../constants/geoData';
import { useToast } from '../hooks/useToast';
import { useAdminScope } from '../layouts/MainLayout';

export const OfficersPage: React.FC = () => {
  const { selectedState } = useAdminScope();
  const { success, deleted, error: toastError, info } = useToast();

  const [stateFilter, setStateFilter] = useState<string>(selectedState);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { isSuperAdmin } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [selectedOfficerForActivity, setSelectedOfficerForActivity] = useState<Officer | null>(null);
  const [resetPassTarget, setResetPassTarget] = useState<Officer | null>(null);
  const [deleteTargetOfficer, setDeleteTargetOfficer] = useState<Officer | null>(null);

  // Form Cascaded Geo States
  const [formSelectedState, setFormSelectedState] = useState('Tamil Nadu');
  const [formSelectedDistrict, setFormSelectedDistrict] = useState('Chennai');
  const [formSelectedTaluk, setFormSelectedTaluk] = useState('Ambattur');

  const { data: officers, isLoading } = useOfficers({
    state: stateFilter === 'ALL' ? undefined : stateFilter,
    departmentId: departmentFilter === 'ALL' ? undefined : departmentFilter,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
  });

  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: roles } = useRoles();

  const { data: officerLogs, isLoading: isLogsLoading } = useOfficerActivityLogs(
    selectedOfficerForActivity?.id || ''
  );

  const createMutation = useCreateOfficer();
  const updateMutation = useUpdateOfficer();
  const resetPassMutation = useResetOfficerAccess();
  const deleteMutation = useDeleteOfficer();

  const handleDeleteOfficer = async () => {
    if (!deleteTargetOfficer) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetOfficer.id);
      deleted(
        'Officer Deleted',
        `Officer account ${deleteTargetOfficer.fullName} (${deleteTargetOfficer.email}) has been permanently deleted from the database.`
      );
      setDeleteTargetOfficer(null);
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Unable to delete officer login.');
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OfficerFormData>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      status: 'ACTIVE',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const filteredDesignationsForForm = (designations || []).filter(
    (d) => !selectedDepartmentId || d.departmentId === selectedDepartmentId
  );

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showModalPassword, setShowModalPassword] = useState(false);

  const togglePasswordVisibility = (officerId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [officerId]: !prev[officerId],
    }));
  };

  const copyCredentials = (email: string, pass: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${pass}`);
    info('Credentials Copied', `Copied login details for ${email}`);
  };

  const openCreateModal = () => {
    setEditingOfficer(null);
    setFormSelectedState('Tamil Nadu');
    setFormSelectedDistrict('Chennai');
    setFormSelectedTaluk('Ambattur');
    setShowModalPassword(false);

    reset({
      fullName: '',
      employeeId: `GOV-${Math.floor(10000 + Math.random() * 90000)}`,
      email: '',
      password: 'Password@123',
      phone: '',
      departmentId: departments?.[0]?.id || '',
      designationId: designations?.[0]?.id || '',
      roleId: roles?.[0]?.id || '',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT',
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (officer: Officer) => {
    setEditingOfficer(officer);
    const st = officer.scope?.state || 'Tamil Nadu';
    const dist = officer.scope?.district || 'Chennai';
    const tlk = officer.scope?.taluk || '';
    const vil = officer.scope?.village || '';

    setFormSelectedState(st);
    setFormSelectedDistrict(dist);
    setFormSelectedTaluk(tlk);
    setShowModalPassword(false);

    reset({
      fullName: officer.fullName,
      employeeId: officer.employeeId,
      email: officer.email,
      password: officer.password || 'Password@123',
      phone: officer.phone,
      departmentId: officer.departmentId,
      designationId: officer.designationId,
      roleId: officer.roleId || '',
      state: st,
      district: dist,
      taluk: tlk,
      village: vil,
      status: officer.status,
    });
    setIsCreateModalOpen(true);
  };

  const handleStateChange = (st: string) => {
    setFormSelectedState(st);
    setValue('state', st);
    const dists = getDistrictsForState(st);
    const firstDist = dists[0] || '';
    setFormSelectedDistrict(firstDist);
    setValue('district', firstDist);

    const taluks = getTaluksForDistrict(st, firstDist);
    const firstTaluk = taluks[0] || '';
    setFormSelectedTaluk(firstTaluk);
    setValue('taluk', firstTaluk);

    const villages = getVillagesForTaluk(st, firstDist, firstTaluk);
    setValue('village', villages[0] || '');
  };

  const handleDistrictChange = (dist: string) => {
    setFormSelectedDistrict(dist);
    setValue('district', dist);

    const taluks = getTaluksForDistrict(formSelectedState, dist);
    const firstTaluk = taluks[0] || '';
    setFormSelectedTaluk(firstTaluk);
    setValue('taluk', firstTaluk);

    const villages = getVillagesForTaluk(formSelectedState, dist, firstTaluk);
    setValue('village', villages[0] || '');
  };

  const handleTalukChange = (tlk: string) => {
    setFormSelectedTaluk(tlk);
    setValue('taluk', tlk);

    const villages = getVillagesForTaluk(formSelectedState, formSelectedDistrict, tlk);
    setValue('village', villages[0] || '');
  };

  const onSubmit = async (data: OfficerFormData) => {
    try {
      const dto = {
        fullName: data.fullName,
        employeeId: data.employeeId,
        email: data.email,
        password: data.password || 'Password@123',
        phone: data.phone,
        departmentId: data.departmentId,
        designationId: data.designationId,
        roleId: data.roleId || '',
        scope: {
          country: 'India' as const,
          state: data.state,
          district: data.district,
          taluk: data.taluk,
          village: data.village,
        },
        status: data.status,
      };

      if (editingOfficer) {
        await updateMutation.mutateAsync({
          id: editingOfficer.id,
          dto,
        });
        success('Officer Updated', `${data.fullName}'s profile and credentials updated successfully in the database.`);
      } else {
        await createMutation.mutateAsync(dto);
        success('Officer Created', `${data.fullName} (${data.email}) is now created with login credentials in the database.`);
      }
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toastError('Save Failed', err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassTarget) return;
    try {
      await resetPassMutation.mutateAsync(resetPassTarget.id);
      success('Temporary Credential Generated', `Temporary key issued for ${resetPassTarget.fullName}`);
      setResetPassTarget(null);
    } catch (err: any) {
      toastError('Reset Failed', err.message);
    }
  };

  const columns: Column<Officer>[] = [
    {
      key: 'fullName',
      header: 'Officer Name / Emp ID',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
            {row.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.fullName}</p>
            <p className="text-[11px] text-slate-500 font-mono">ID: {row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'designationTitle',
      header: 'Designation & Department',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-slate-900 font-semibold">{row.designationTitle}</p>
          <p className="text-[11px] text-slate-500">{row.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Administrative Scope Jurisdiction',
      render: (row) => <ScopeBadge scope={row.scope} compact />,
    },
    {
      key: 'roleName',
      header: 'Assigned RBAC Role',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.roleName}
        </span>
      ),
    },
    {
      key: 'credentials',
      header: 'Login Credentials (Email & Password)',
      render: (row) => {
        const pass = row.password || 'Password@123';
        const isVisible = showPasswordMap[row.id];

        return (
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1 max-w-[220px]">
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-900 font-bold">
              <span className="truncate" title={row.email}>{row.email}</span>
              <button
                type="button"
                onClick={() => copyCredentials(row.email, pass)}
                className="p-1 rounded text-slate-400 hover:text-black hover:bg-slate-200 transition-colors shrink-0"
                title="Copy Email & Password"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200/60 pt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Lock className="w-3 h-3 text-slate-500" />
                {isVisible ? pass : '••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => togglePasswordVisibility(row.id)}
                className="p-0.5 rounded text-slate-500 hover:text-black transition-colors"
                title={isVisible ? 'Hide Password' : 'Show Password'}
              >
                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedOfficerForActivity(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            title="Inspect Verification Audit Logs"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setResetPassTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            title="Reset Access Credentials"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            title="Edit Officer Profile & Scope"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setDeleteTargetOfficer(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Officer Login (Super Admin Only)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const availableDistricts: string[] = getDistrictsForState(formSelectedState);
  const availableTaluks: string[] = getTaluksForDistrict(formSelectedState, formSelectedDistrict);
  const availableVillages: string[] = getVillagesForTaluk(formSelectedState, formSelectedDistrict, formSelectedTaluk);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Organization' }, { label: 'Officers Directory' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Government Officers & Verifying Authorities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage field surveyors, Tahsildars, Sub-Registrars, assign administrative jurisdiction scopes, and monitor clearance logs.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Officer</span>
        </button>
      </div>

      {/* Filter and Directory Table */}
      <DataTable
        data={officers || []}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search officers by name, email, employee ID..."
        exportFileName="officers_directory"
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All States</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        }
      />

      {/* Onboard / Edit Officer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingOfficer ? 'Edit Officer Profile & Scope' : 'Onboard New Government Officer'}
        subtitle="Department → Designation → Role → Geographic Jurisdiction Assignment."
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Official Name *
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Employee Service ID *
              </label>
              <input
                type="text"
                {...register('employeeId')}
                placeholder="e.g. GOV-TN-SUR-8841"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black uppercase"
              />
              {errors.employeeId && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.employeeId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Government Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="e.g. priya.sharma@landrecords.gov.in"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Officer Password *
                </label>
                <button
                  type="button"
                  onClick={() => setValue('password', 'Password@123')}
                  className="text-[10px] text-black hover:underline font-semibold"
                >
                  Set Default
                </button>
              </div>
              <div className="relative">
                <input
                  type={showModalPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Password@123"
                  className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-black"
                >
                  {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Mobile Contact *
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="e.g. +91 98450 12345"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Department, Designation, Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department *
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designation *
              </label>
              <select
                {...register('designationId')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                {filteredDesignationsForForm.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned RBAC Role
              </label>
              <select
                {...register('roleId')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                {(roles || []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cascaded Administrative Scope Jurisdiction */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Geographic Jurisdiction Scope (India → State → District → Taluk → Village)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  1. State / UT *
                </label>
                <select
                  value={formSelectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                >
                  {ALL_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  2. District Jurisdiction *
                </label>
                <select
                  value={formSelectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                >
                  {availableDistricts.map((dst: string) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  3. Taluk / Sub-District *
                </label>
                <select
                  value={formSelectedTaluk}
                  onChange={(e) => handleTalukChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                >
                  {availableTaluks.map((tlk: string) => (
                    <option key={tlk} value={tlk}>
                      {tlk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  4. Village / Ward (Optional)
                </label>
                <select
                  {...register('village')}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                >
                  {availableVillages.map((vlg: string) => (
                    <option key={vlg} value={vlg}>
                      {vlg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ACTIVE">ACTIVE (Authorized to Verify & Approve)</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
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
              {isSubmitting ? 'Processing...' : editingOfficer ? 'Save Officer Profile' : 'Onboard Officer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Officer Activity Drawer */}
      {selectedOfficerForActivity && (
        <Drawer
          isOpen={Boolean(selectedOfficerForActivity)}
          onClose={() => setSelectedOfficerForActivity(null)}
          title={`Verification Ledger: ${selectedOfficerForActivity.fullName}`}
          subtitle={`${selectedOfficerForActivity.designationTitle} • ${selectedOfficerForActivity.departmentName}`}
          width="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p>
                <strong className="text-slate-900">Assigned Scope:</strong>{' '}
                <ScopeBadge scope={selectedOfficerForActivity.scope} compact />
              </p>
              <p className="text-slate-600 font-mono">
                Employee ID: <strong className="text-slate-900">{selectedOfficerForActivity.employeeId}</strong>
              </p>
            </div>

            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Cadastral Actions & Clearances
            </h4>

            <div className="space-y-3">
              {isLogsLoading ? (
                <p className="text-xs text-slate-500">Loading activity trail...</p>
              ) : (officerLogs || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No recorded verification actions by this officer in this billing cycle.
                </p>
              ) : (
                (officerLogs || []).map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.landId && (
                      <p className="text-slate-700">
                        Target Parcel: <strong className="text-black font-mono">{log.landId}</strong>
                      </p>
                    )}
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-bold">
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Drawer>
      )}

      {/* Reset Password Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(resetPassTarget)}
        onClose={() => setResetPassTarget(null)}
        onConfirm={handleResetPassword}
        title="Reset Access Credentials"
        message={`Issue a temporary access key for ${resetPassTarget?.fullName} (${resetPassTarget?.employeeId})? A secure temporary password will be dispatched to their official email.`}
        variant="warning"
        confirmText="Issue Temporary Key"
        isLoading={resetPassMutation.isPending}
      />

      {/* Delete Officer Confirm Dialog (Super Admin Only) */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetOfficer)}
        onClose={() => setDeleteTargetOfficer(null)}
        onConfirm={handleDeleteOfficer}
        title="Delete Officer Login ID"
        message={`Are you sure you want to permanently delete officer login ${deleteTargetOfficer?.email} (${deleteTargetOfficer?.fullName} - ${deleteTargetOfficer?.employeeId})? This action cannot be undone and will revoke their login credentials.`}
        variant="danger"
        confirmText="Delete Officer Account"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
