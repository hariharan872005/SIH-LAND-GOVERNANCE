import React, { useState } from 'react';
import { User, FileText, ArrowRight, ShieldCheck, Database, Sparkles, Building2, ChevronRight, Hash, Calendar, DollarSign } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'OWNER' | 'DEED' | 'PARCEL';
  subtitle?: string;
  isCurrent?: boolean;
  meta?: Record<string, any>;
}

interface Neo4jLineageGraphViewProps {
  landId: string;
  surveyNumber: string;
  ownershipHistory: any[];
  transactions: any[];
  currentOwner?: any;
}

export const Neo4jLineageGraphView: React.FC<Neo4jLineageGraphViewProps> = ({
  landId,
  surveyNumber,
  ownershipHistory = [],
  transactions = [],
  currentOwner,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Build graph nodes from authoritative backend records
  const nodes: GraphNode[] = [];

  // 1. Cadastral Parcel Node (Anchor)
  const parcelNode: GraphNode = {
    id: `parcel-${landId}`,
    label: `Survey #${surveyNumber}`,
    type: 'PARCEL',
    subtitle: landId,
    meta: {
      'Entity Type': 'Cadastral Land Parcel',
      'Identifier (ULPIN)': landId,
      'Survey Number': surveyNumber,
      'PostGIS Table': 'public.spatial_parcels_india',
      'Authority': 'Tamil Nadu Cadastre Registry',
    },
  };
  nodes.push(parcelNode);

  // 2. Owner Nodes
  if (ownershipHistory && ownershipHistory.length > 0) {
    ownershipHistory.forEach((owner, idx) => {
      const isCurr = Boolean(owner.isCurrentOwner) || (currentOwner && owner.name === currentOwner.ownerName);
      nodes.push({
        id: `owner-${owner.id || idx}`,
        label: owner.name || owner.ownerName || `Owner #${idx + 1}`,
        type: 'OWNER',
        subtitle: isCurr ? 'Current Title Holder' : 'Predecessor Title Holder',
        isCurrent: isCurr,
        meta: {
          'Owner Name': owner.name || owner.ownerName,
          'Entity Type': owner.ownershipType || 'INDIVIDUAL',
          'Share Holding': `${owner.ownershipPercentage || 100}%`,
          'Identity Hash': owner.panOrAadhaarHash || owner.ownerIdHash || 'GOV_REGISTRY_RECORD',
          'Acquisition Date': owner.acquiredDate ? new Date(owner.acquiredDate).toLocaleDateString('en-IN') : 'Historical Initial Record',
          'Deed Number': owner.deedRegistrationNumber || 'N/A',
          'Consideration Value': owner.considerationAmountINR ? `₹${Number(owner.considerationAmountINR).toLocaleString('en-IN')}` : 'State Allotment',
        },
      });
    });
  } else if (currentOwner) {
    nodes.push({
      id: 'owner-current',
      label: currentOwner.ownerName || 'Authoritative Holder',
      type: 'OWNER',
      subtitle: 'Current Title Holder',
      isCurrent: true,
      meta: {
        'Owner Name': currentOwner.ownerName,
        'Entity Type': currentOwner.ownershipType || 'INDIVIDUAL',
        'Deed Reference': currentOwner.deedRegistrationNumber || 'DOC/REG/TN',
        'Identity Hash': currentOwner.ownerIdHash || 'PAN/AADHAAR_ENC',
      },
    });
  }

  // 3. Registered Deed Transaction Nodes
  if (transactions && transactions.length > 0) {
    transactions.forEach((tx, idx) => {
      nodes.push({
        id: `tx-${tx.id || idx}`,
        label: `${tx.transferType || 'CONVEYANCE'} Deed`,
        type: 'DEED',
        subtitle: tx.deedNumber || `DOC/${idx + 1}`,
        meta: {
          'Transfer Type': tx.transferType || 'SALE',
          'Deed Number': tx.deedNumber,
          'Registration Number': tx.registrationNumber,
          'Consideration (INR)': tx.considerationAmountINR ? `₹${Number(tx.considerationAmountINR).toLocaleString('en-IN')}` : 'N/A',
          'SRO Office': tx.subRegistrarOffice || 'Sub-Registrar Office Ambattur',
          'Registration Date': tx.registrationDate ? new Date(tx.registrationDate).toLocaleDateString('en-IN') : 'N/A',
        },
      });
    });
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Graph Visual Canvas (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Network Canvas Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>Neo4j Graph Database Lineage Model</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-bold">
                  CYPHER PROJECTION
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Directed entity-relationship property graph tracing immutable root of title
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Graph Engine Synchronized
            </span>
          </div>
        </div>

        {/* Visual Entity Graph Layout */}
        <div className="relative z-10 py-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isParcel = node.type === 'PARCEL';
            const isDeed = node.type === 'DEED';
            const isCurr = node.isCurrent;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer text-left relative group min-w-[150px] max-w-[190px] ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-lg scale-105 ring-2 ring-blue-500/30'
                    : isCurr
                    ? 'bg-emerald-50/90 border-emerald-400 shadow-sm hover:scale-102 ring-1 ring-emerald-300'
                    : isParcel
                    ? 'bg-white border-blue-300 hover:border-blue-500 shadow-sm'
                    : isDeed
                    ? 'bg-white border-purple-300 hover:border-purple-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                }`}
              >
                {/* Node Icon Avatar */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 shadow-md transition-transform group-hover:scale-105 ${
                    isCurr
                      ? 'bg-emerald-600 text-white'
                      : isParcel
                      ? 'bg-blue-600 text-white'
                      : isDeed
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isParcel ? (
                    <Building2 className="w-6 h-6" />
                  ) : isDeed ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <div className="font-extrabold text-xs text-slate-900 text-center truncate w-full">
                  {node.label}
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-center mt-0.5 truncate w-full">
                  {node.subtitle}
                </div>

                {isCurr ? (
                  <span className="mt-2 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    Current Title
                  </span>
                ) : (
                  <span className="mt-2 text-[9px] font-mono text-slate-400 uppercase">
                    {node.type} NODE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Node Property Inspector */}
        {selectedNode && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-300 text-xs space-y-3 animate-fadeIn relative z-10 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Node Inspector: {selectedNode.label}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 uppercase">
                {selectedNode.type}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedNode.meta &&
                Object.entries(selectedNode.meta).map(([key, val]) => (
                  <div key={key} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{key}</span>
                    <div className="font-mono text-xs text-slate-800 font-medium truncate" title={String(val)}>
                      {String(val || 'N/A')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Chronological Ownership Timeline */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Chronological Ownership Conveyance Chain</span>
          </h4>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold">
            {ownershipHistory.length} Registered Transfers
          </span>
        </div>

        {ownershipHistory.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Primary state cadastral allocation record. No secondary conveyances registered.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 mt-2">
            {ownershipHistory.map((hist, idx) => {
              const isCurr = Boolean(hist.isCurrentOwner);
              return (
                <div key={hist.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[31px] top-2 h-4 w-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                      isCurr
                        ? 'bg-emerald-500 border-emerald-300 shadow-md shadow-emerald-500/50'
                        : 'bg-white border-slate-400'
                    }`}
                  />

                  <div
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isCurr
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <span>{hist.name || hist.ownerName}</span>
                          {isCurr && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                              Active Title
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Ownership Share: <b>{hist.ownershipPercentage}%</b> ({hist.ownershipType || 'INDIVIDUAL'})
                        </div>
                      </div>

                      {hist.considerationAmountINR && (
                        <div className="text-right">
                          <div className="text-base font-extrabold text-emerald-700">
                            ₹{Number(hist.considerationAmountINR).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">Consideration Paid</div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-slate-500">Deed Reg #</div>
                          <div className="font-mono text-slate-800 font-semibold truncate">
                            {hist.deedRegistrationNumber || 'SRO Record'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-slate-500">Acquisition Date</div>
                          <div className="text-slate-800 font-semibold">
                            {hist.acquiredDate ? new Date(hist.acquiredDate).toLocaleDateString('en-IN') : 'Historical Record'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-slate-500">Identity Record</div>
                          <div className="font-mono text-slate-800 font-medium truncate" title={hist.panOrAadhaarHash}>
                            {hist.panOrAadhaarHash || 'AADHAAR / PAN HASH'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
