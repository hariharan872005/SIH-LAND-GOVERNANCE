import React from 'react';
import { OwnershipHistory } from '../../types';
import { UserCheck, ArrowRight, FileText, Calendar, Building2, ShieldCheck, History } from 'lucide-react';

interface OwnershipTimelineProps {
  history?: OwnershipHistory | null;
  isLoading?: boolean;
}

export const OwnershipTimeline: React.FC<OwnershipTimelineProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!history || (!history.currentOwner && history.lineage.length === 0)) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        <History className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p className="font-bold text-slate-700">No Ownership Lineage Recorded</p>
        <p className="text-slate-400 mt-1">This land parcel is in primary revenue allocation stage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Current Owner Banner */}
      {history.currentOwner && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider">
                Authoritative Current Title Holder
              </div>
              <div className="font-extrabold text-sm text-slate-900">{history.currentOwner.name}</div>
              <div className="text-xs text-slate-600 font-medium">
                {history.currentOwner.type} • Acquired: {history.currentOwner.acquiredDate || 'Active Record'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Verified Owner
          </span>
        </div>
      )}

      {/* Lineage Timeline Graph */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider px-1">
          <History className="w-4 h-4 text-blue-600" />
          <span>Neo4j Ownership Transfer Graph ({history.lineage.length})</span>
        </div>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
          {history.lineage.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Graph Node Marker */}
              <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform" />

              <div className="bg-white border border-slate-200 group-hover:border-blue-400 p-4 rounded-2xl shadow-sm transition-all space-y-2">
                {/* Transfer Step Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs">{item.previousOwnerName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-emerald-700 text-xs">{item.newOwnerName}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                    {item.transferType}
                  </span>
                </div>

                {/* Deed Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deed: <strong className="text-slate-900 font-mono">{item.deedNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reg Date: <strong className="text-slate-900">{item.registrationDate}</strong></span>
                  </div>
                  {item.considerationAmountINR && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Consideration: <strong className="text-emerald-700">₹{item.considerationAmountINR.toLocaleString('en-IN')}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
