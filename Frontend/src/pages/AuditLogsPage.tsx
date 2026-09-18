import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Terminal 
} from 'lucide-react';
import { useAuditLogs } from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Modal } from '../components/common/Modal';
import { AuditLogRecord } from '../types';

export const AuditLogsPage: React.FC = () => {
  const { data: auditLogs, isLoading } = useAuditLogs();
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [selectedAuditForDiff, setSelectedAuditForDiff] = useState<AuditLogRecord | null>(null);

  const filteredLogs = (auditLogs || []).filter((l) => {
    if (moduleFilter === 'ALL') return true;
    return l.module === moduleFilter;
  });

  const columns: Column<AuditLogRecord>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <div className="font-mono text-[11px] text-slate-500">
          <p className="text-slate-900 font-bold">{new Date(row.timestamp).toLocaleDateString()}</p>
          <p>{new Date(row.timestamp).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'officerName',
      header: 'Officer / Actor',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.officerName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.officerDesignation}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Governance Action',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 font-bold">
            {row.action}
          </span>
          {row.landId && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Parcel: <strong className="text-black font-mono">{row.landId}</strong>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module Silo',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {row.module}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP / Terminal',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">
          {row.ipAddress}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        if (row.status === 'SUCCESS') {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
            </span>
          );
        }
        if (row.status === 'WARNING') {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> WARNING
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-bold">
            <XCircle className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'State Diff',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedAuditForDiff(row)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
          title="Inspect JSON Mutation Diff"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Audit Logs' }]} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> IMMUTABLE AUDIT TRAIL
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Governance Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Comprehensive tamper-evident ledger recording all cadastral title clearances, officer onboarding, DGPS boundary adjustments, and credential updates.
        </p>
      </div>

      {/* Audit Logs Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search audit logs by officer, Land ID, action..."
        exportFileName="governance_audit_ledger"
        filterSlot={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All System Modules</option>
              <option value="LAND_GOVERNANCE">Land Governance</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="ACCESS_CONTROL">Access Control</option>
              <option value="DOCUMENTS">Documents</option>
              <option value="DIGITAL_TWIN">Digital Twin</option>
            </select>
          </div>
        }
      />

      {/* JSON Diff State Inspector Modal */}
      {selectedAuditForDiff && (
        <Modal
          isOpen={Boolean(selectedAuditForDiff)}
          onClose={() => setSelectedAuditForDiff(null)}
          title={`Audit Event: ${selectedAuditForDiff.action}`}
          subtitle={`By ${selectedAuditForDiff.officerName} (${selectedAuditForDiff.officerDesignation}) at ${new Date(
            selectedAuditForDiff.timestamp
          ).toLocaleString()}`}
          size="xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p>
                <span className="text-slate-500">Module:</span>{' '}
                <strong className="text-slate-900">{selectedAuditForDiff.module}</strong>
              </p>
              {selectedAuditForDiff.landId && (
                <p>
                  <span className="text-slate-500">Target Parcel ID:</span>{' '}
                  <strong className="text-black">{selectedAuditForDiff.landId}</strong>
                </p>
              )}
              <p>
                <span className="text-slate-500">Source IP:</span>{' '}
                <strong className="text-slate-800">{selectedAuditForDiff.ipAddress}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Previous State */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-rose-700 font-bold uppercase text-[10px] tracking-wider block">
                  - Previous State (Before Mutation)
                </span>
                <pre className="text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                  {selectedAuditForDiff.previousValue
                    ? typeof selectedAuditForDiff.previousValue === 'object'
                      ? JSON.stringify(selectedAuditForDiff.previousValue, null, 2)
                      : String(selectedAuditForDiff.previousValue)
                    : '(Initial Entry / None)'}
                </pre>
              </div>

              {/* New State */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-wider block">
                  + New State (Committed State)
                </span>
                <pre className="text-[11px] text-slate-900 overflow-x-auto whitespace-pre-wrap font-semibold">
                  {selectedAuditForDiff.newValue
                    ? typeof selectedAuditForDiff.newValue === 'object'
                      ? JSON.stringify(selectedAuditForDiff.newValue, null, 2)
                      : String(selectedAuditForDiff.newValue)
                    : '(Record Removed)'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAuditForDiff(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-sans text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
