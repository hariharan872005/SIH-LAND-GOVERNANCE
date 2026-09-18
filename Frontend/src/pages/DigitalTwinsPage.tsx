import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  MapPin, 
  ExternalLink, 
  Database, 
  Filter,
  Grid,
  List
} from 'lucide-react';
import { useLandParcels } from '../hooks/useQueries';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { DigitalTwinDetail } from '../types';
import { ALL_STATES } from '../constants/geoData';

export const DigitalTwinsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [landTypeFilter, setLandTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: parcels, isLoading } = useLandParcels({
    state: stateFilter === 'ALL' ? undefined : stateFilter,
    landType: landTypeFilter === 'ALL' ? undefined : landTypeFilter,
  });

  const displayedParcels = useMemo(() => {
    return (parcels || []).filter((item) => {
      if (stateFilter !== 'ALL' && item.state !== stateFilter) return false;
      if (landTypeFilter !== 'ALL' && item.landType !== landTypeFilter) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matches =
          item.landId.toLowerCase().includes(term) ||
          item.surveyNumber.toLowerCase().includes(term) ||
          item.currentOwnerName.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term) ||
          item.state.toLowerCase().includes(term) ||
          item.taluk.toLowerCase().includes(term) ||
          item.village.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [parcels, stateFilter, landTypeFilter, searchQuery]);

  const columns: Column<DigitalTwinDetail>[] = [
    {
      key: 'landId',
      header: 'Land ID / Survey',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900">{row.landId}</span>
          <p className="text-[11px] text-slate-500 font-mono">Survey: {row.surveyNumber}</p>
        </div>
      ),
    },
    {
      key: 'currentOwnerName',
      header: 'Current Title Holder',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-slate-900 font-semibold">{row.currentOwnerName}</p>
          <p className="text-[11px] text-slate-500 font-mono">UID: {row.currentOwnerAadhaarMasked || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location & Extent',
      render: (row) => (
        <div>
          <p className="text-slate-800">{row.district}, {row.state}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">{row.areaInAcres} Acres ({row.areaInSqMeters} m²)</p>
        </div>
      ),
    },
    {
      key: 'landType',
      header: 'Zoning Classification',
      sortable: true,
      render: (row) => <StatusBadge status={row.landType} />,
    },
    {
      key: 'overallStatus',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.overallStatus} />,
    },
    {
      key: 'gisBoundary',
      header: 'Spatial Layer Status',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-mono">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>PostGIS EPSG:4326</span>
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
          onClick={() => navigate(`/governance/digital-twins/${row.landId}`)}
          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
        >
          <span>Open Twin</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Digital Twin Operations' }, { label: 'Active Land Twins' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> 4-PILLAR REVENUE Cadastre
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cadastral Digital Twin Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time multi-dimensional representations of land parcels unifying PostGIS coordinates, Neo4j historical lineage graphs, S3 legal deeds, and municipal tax assessments.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Land ID, Survey #, Owner..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All States</option>
              {ALL_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={landTypeFilter}
              onChange={(e) => setLandTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Land Types</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-slate-900">{displayedParcels.length}</strong> Digital Twins
        </span>
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedParcels.map((parcel) => (
            <div
              key={parcel.id}
              onClick={() => navigate(`/governance/digital-twins/${parcel.landId}`)}
              className="group bg-white border border-slate-200 hover:border-black rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-wider">
                      {parcel.landId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-black transition-colors">
                      Survey #{parcel.surveyNumber}
                    </h3>
                  </div>
                  <StatusBadge status={parcel.overallStatus} />
                </div>

                {/* Location & Zoning */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {parcel.village}, {parcel.district}, {parcel.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase font-semibold">Registered Extent</span>
                      <p className="font-bold text-slate-900">{parcel.areaInAcres} Acres</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-600 uppercase font-semibold">Guideline Value</span>
                      <p className="font-bold text-slate-900">
                        ₹{(parcel.marketValueINR / 100000).toFixed(1)} Lakh
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-700">
                  <Database className="w-3 h-3" />
                  <span>GeoServer WFS</span>
                </span>

                <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                  Inspect Twin →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          data={displayedParcels}
          columns={columns}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search Land ID (TN-101), Survey #, Owner..."
          searchKey={(row) => `${row.landId} ${row.surveyNumber} ${row.currentOwnerName} ${row.district} ${row.state} ${row.taluk} ${row.village} ${row.landType} ${row.overallStatus}`}
          exportFileName="digital_twins_registry"
        />
      )}
    </div>
  );
};
