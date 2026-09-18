import React from 'react';
import { LandVerificationRecord } from '../../types';
import { ShieldCheck, User, Calendar, FileText, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { getStatusBadgeConfig } from '../../utils/geoUtils';

interface VerificationPillarListProps {
  verifications: LandVerificationRecord[];
}

export const VerificationPillarList: React.FC<VerificationPillarListProps> = ({ verifications }) => {
  if (!verifications || verifications.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
        No verification records found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider px-1">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>Departmental Authorization Audit Trail</span>
      </div>

      <div className="space-y-2.5">
        {verifications.map((record) => {
          const badge = getStatusBadgeConfig(record.status);
          return (
            <div
              key={record.id}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200">
                  {record.departmentName || 'Government Department'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bgColor}`}>
                  {badge.label}
                </span>
              </div>

              {record.remarks && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 italic">
                  "{record.remarks}"
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span>{record.officerName || 'Department Officer'}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{record.verifiedAt ? new Date(record.verifiedAt).toLocaleDateString() : 'Pending'}</span>
                </div>
                {record.referenceDocketNumber && (
                  <div className="flex items-center gap-1 col-span-2 text-slate-400">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Docket #: <strong className="text-slate-200 font-mono">{record.referenceDocketNumber}</strong></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
