import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { usePermissions } from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Permission } from '../types';

export const PermissionsPage: React.FC = () => {
  const { data: permissions, isLoading } = usePermissions();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredPermissions = (permissions || []).filter((p) => {
    if (categoryFilter === 'ALL') return true;
    return p.category === categoryFilter;
  });

  const columns: Column<Permission>[] = [
    {
      key: 'name',
      header: 'Permission Capability Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-500 max-w-sm truncate">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'System Permission Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 font-bold">
          {row.code}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Governance Category / Silo',
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.category}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Enforcement Status',
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-900 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ENFORCED
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Access Control' }, { label: 'Permissions Matrix' }]} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> GRANULAR CAPABILITY POLICY
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Permissions Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          National Cadastre granular permission definitions across Revenue, Survey DGPS, Registration & Stamps, Municipality, and Super Admin governance.
        </p>
      </div>

      {/* Permissions Table */}
      <DataTable
        data={filteredPermissions}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search permission codes or descriptions..."
        exportFileName="system_permissions_matrix"
        filterSlot={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Governance Categories</option>
              <option value="REVENUE">Revenue / Land Records</option>
              <option value="SURVEY">Survey & Land Records</option>
              <option value="REGISTRATION">Registration & Stamps</option>
              <option value="MUNICIPALITY">Municipality / Local Body</option>
              <option value="SYSTEM">System Super Admin</option>
            </select>
          </div>
        }
      />
    </div>
  );
};
