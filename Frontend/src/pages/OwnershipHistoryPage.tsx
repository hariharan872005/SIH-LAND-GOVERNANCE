import React, { useState } from 'react';
import { 
  Network, 
  Search 
} from 'lucide-react';
import { useLandParcels } from '../hooks/useQueries';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Neo4jGraphViewer } from '../components/common/Neo4jGraphViewer';
import { StatusBadge } from '../components/common/StatusBadge';

export const OwnershipHistoryPage: React.FC = () => {
  const { data: parcels } = useLandParcels();
  const [selectedLandId, setSelectedLandId] = useState<string>('TN-CHE-101');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedParcel = parcels?.find(
    (p) => p.landId.toLowerCase() === selectedLandId.toLowerCase()
  ) || parcels?.[0];

  const filteredParcels = (parcels || []).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.landId.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q) ||
      p.currentOwnerName.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Land Governance' }, { label: 'Ownership History & Mutations' }]} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> REGISTERED TITLE & DEED LEDGER
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Land Ownership History & Title Chain
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Trace the complete history of registered sale deeds, inheritance transfers, and past land owners for every parcel.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parcel Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Cadastral Parcel
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {filteredParcels.length} Found
            </span>
          </div>

          {/* Search Parcel */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Land ID, Survey #, Owner..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* List of Parcels */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredParcels.map((parcel) => {
              const isSelected = parcel.landId === (selectedParcel?.landId || '');
              return (
                <div
                  key={parcel.id}
                  onClick={() => setSelectedLandId(parcel.landId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 border-black shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-black font-mono">
                      {parcel.landId}
                    </span>
                    <StatusBadge status={parcel.overallStatus} size="sm" />
                  </div>

                  <p className="text-xs font-bold text-slate-900 truncate">
                    Survey #{parcel.surveyNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {parcel.currentOwnerName}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100">
                    <span>{parcel.district}, {parcel.state}</span>
                    <span className="text-slate-900 font-bold">{parcel.areaInAcres} Acres</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Graph Lineage Display */}
        <div className="lg:col-span-8">
          {selectedParcel ? (
            <Neo4jGraphViewer
              lineage={selectedParcel.ownershipLineage || []}
              landId={selectedParcel.landId}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Select a parcel from the left to load its Neo4j ownership graph lineage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
