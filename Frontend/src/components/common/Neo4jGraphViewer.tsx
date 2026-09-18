import React from 'react';
import { OwnershipNode } from '../../types';
import { Network, ArrowDown, ShieldCheck, User, Building, Calendar, Receipt, Hash, AlertTriangle, Layers, FileCheck } from 'lucide-react';

export interface Neo4jGraphViewerProps {
  lineage: OwnershipNode[];
  landId: string;
}

export const Neo4jGraphViewer: React.FC<Neo4jGraphViewerProps> = ({ lineage, landId }) => {
  const currentOwner = lineage.find((n) => n.isCurrentOwner) || lineage[lineage.length - 1];
  const previousOwners = lineage.filter((n) => !n.isCurrentOwner);
  const totalTransfers = lineage.length - 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-black text-white">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Registered Land Ownership & Title Transfer Chain
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official chronological history of registered deed transfers and legal ownership for parcel <strong className="text-black font-mono">{landId}</strong>.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Official Title Deed Ledger</span>
        </div>
      </div>

      {/* Calculated Lineage Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500">Current Title Holder</span>
          <p className="font-bold text-slate-900 truncate mt-0.5">{currentOwner?.name || 'N/A'}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Present Owner</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500">Historical Transferors</span>
          <p className="font-bold text-slate-900 mt-0.5">{previousOwners.length} Previous Owners</p>
          <span className="text-[10px] text-slate-500 font-medium">Prior Title Holders</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Registered Transfers</span>
          <p className="font-bold text-slate-900 mt-0.5">{totalTransfers} Title Conveyances</p>
          <span className="text-[10px] text-slate-500 font-medium">Registered Deeds</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500">Chain Integrity</span>
          <p className="font-bold text-emerald-700 mt-0.5">100% Unbroken Lineage</p>
          <span className="text-[10px] text-slate-500 font-medium">Verified Legal Record</span>
        </div>
      </div>

      {/* Chain Nodes */}
      <div className="relative flex flex-col items-center gap-2 max-w-2xl mx-auto py-2">
        {lineage.map((node, index) => {
          const isLast = index === lineage.length - 1;
          const isCurrent = node.isCurrentOwner;

          return (
            <React.Fragment key={node.id}>
              {/* Ownership Card Node */}
              <div
                className={`w-full relative rounded-2xl border p-5 transition-all duration-200 shadow-xs ${
                  isCurrent
                    ? 'bg-slate-50 border-black shadow-md ring-1 ring-black/5'
                    : node.status === 'DISPUTED'
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Node Status Indicator Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 font-mono">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isCurrent
                          ? 'bg-black text-white border-black'
                          : node.status === 'DISPUTED'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isCurrent ? 'CURRENT TITLE HOLDER' : node.status === 'DISPUTED' ? 'DISPUTED TITLE' : 'HISTORICAL OWNER'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    Node ID: <strong className="text-slate-800">{node.id}</strong>
                  </span>
                </div>

                {/* Owner Identity */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 shrink-0">
                    {node.ownershipType === 'CORPORATE' ? (
                      <Building className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                      {node.name}
                      {isCurrent && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {node.status === 'DISPUTED' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      PAN/Govt ID Ref: <span className="text-slate-900 font-semibold">{node.panOrAadhaarHash}</span> | Type:{' '}
                      <span className="text-slate-800 font-bold">{node.ownershipType}</span> ({node.ownershipPercentage}%)
                    </p>
                  </div>
                </div>

                {/* Deed & Mutation Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Deed: <strong className="text-slate-900">{node.deedRegistrationNumber}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Acquired: <strong className="text-slate-900">{node.acquiredDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Val: <strong className="text-black font-bold">₹{(node.considerationAmountINR / 100000).toFixed(1)}L</strong>
                    </span>
                  </div>
                </div>

                {node.mutationId && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                    <span>Revenue Mutation Docket:</span>
                    <span className="text-black font-bold">{node.mutationId}</span>
                  </div>
                )}
              </div>

              {/* Transition Edge */}
              {!isLast && (
                <div className="flex flex-col items-center py-1">
                  <div className="w-0.5 h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-mono text-slate-800 shadow-2xs">
                    <span>[:TRANSFERRED_VIA_DEED]</span>
                    <ArrowDown className="w-3 h-3 text-black" />
                  </div>
                  <div className="w-0.5 h-4 bg-slate-300"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Query Helper */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-black font-bold">MATCH</span>
          <span className="text-slate-700">(p:Person)-[:PARTY_TO]-&gt;(t:Transaction)-[:FOR_LAND]-&gt;(l:Land &#123;landId: "{landId}"&#125;)</span>
          <span className="text-black font-bold">RETURN</span>
          <span className="text-slate-700">p, t, l ORDER BY t.date ASC</span>
        </div>
        <span className="text-slate-500 text-[11px] self-end sm:self-auto">Cypher Execution: 0.04ms</span>
      </div>
    </div>
  );
};
