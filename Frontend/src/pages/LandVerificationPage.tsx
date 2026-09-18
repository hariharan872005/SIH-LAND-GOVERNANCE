import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  ExternalLink, 
  Layers, 
  FileText, 
  Building, 
  Compass, 
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Network,
  Receipt,
  UserCheck
} from 'lucide-react';
import { useLandParcels } from '../hooks/useQueries';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge, PillarPill } from '../components/common/StatusBadge';
import { Drawer } from '../components/common/Drawer';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { DigitalTwinDetail } from '../types';
import { ALL_STATES } from '../constants/geoData';
import { useToast } from '../hooks/useToast';
import { useAdminScope } from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { CreateLandParcelModal } from '../components/workflow/CreateLandParcelModal';
import { SurveyorGISDrawer } from '../components/workflow/SurveyorGISDrawer';
import { SubRegistrarTransferModal } from '../components/workflow/SubRegistrarTransferModal';
import { MunicipalVerificationDrawer } from '../components/workflow/MunicipalVerificationDrawer';

export const LandVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState } = useAdminScope();
  const { currentUser, isSuperAdmin, isTahsildar, isSurveyor, isSubRegistrar, isRevenueOfficer } = useAuth();
  const { info, error: toastError } = useToast();

  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [landTypeFilter, setLandTypeFilter] = useState<string>('ALL');

  // Workflow Dialog States
  const [isCreateParcelModalOpen, setIsCreateParcelModalOpen] = useState(false);
  const [surveyorTargetParcel, setSurveyorTargetParcel] = useState<DigitalTwinDetail | null>(null);
  const [subRegistrarTargetParcel, setSubRegistrarTargetParcel] = useState<DigitalTwinDetail | null>(null);
  const [municipalTargetParcel, setMunicipalTargetParcel] = useState<DigitalTwinDetail | null>(null);
  const [selectedParcelForDossier, setSelectedParcelForDossier] = useState<DigitalTwinDetail | null>(null);

  const { data: parcels, isLoading } = useLandParcels({
    state: stateFilter === 'ALL' ? undefined : stateFilter,
    taluk: !isSuperAdmin ? currentUser.scope.taluk : undefined,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
    landType: landTypeFilter === 'ALL' ? undefined : (landTypeFilter as any),
  });

  const displayedParcels = useMemo(() => {
    return (parcels || []).filter((item) => {
      if (stateFilter !== 'ALL' && item.state !== stateFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && item.overallStatus !== statusFilter) {
        return false;
      }
      if (landTypeFilter !== 'ALL' && item.landType !== landTypeFilter) {
        return false;
      }
      return true;
    });
  }, [parcels, stateFilter, statusFilter, landTypeFilter]);

  const handlePillarClick = (parcel: DigitalTwinDetail, pillar: 'revenue' | 'survey' | 'registration' | 'municipality') => {
    if (pillar === 'survey') {
      if (isSurveyor || isSuperAdmin) {
        setSurveyorTargetParcel(parcel);
      } else {
        info('Surveyor Role Required', 'Switch to the Surveyor persona to demarcate GIS boundaries.');
        setSelectedParcelForDossier(parcel);
      }
    } else if (pillar === 'registration') {
      if (parcel.verificationMatrix.survey?.status !== 'VERIFIED') {
        toastError(
          'Survey Verification Required',
          `Land parcel ${parcel.landId} cannot be verified or transferred by the Sub-Registrar until the Survey Department completes DGPS demarcation and marks the Survey pillar as VERIFIED.`
        );
        return;
      }
      if (isSubRegistrar || isSuperAdmin) {
        setSubRegistrarTargetParcel(parcel);
      } else {
        info('Sub-Registrar Role Required', 'Switch to the Sub-Registrar persona to register deeds and execute transfers.');
        setSelectedParcelForDossier(parcel);
      }
    } else if (pillar === 'municipality') {
      if (isRevenueOfficer || isSuperAdmin) {
        setMunicipalTargetParcel(parcel);
      } else {
        info('Revenue Officer Role Required', 'Switch to Revenue Officer persona for municipal tax assessment.');
        setSelectedParcelForDossier(parcel);
      }
    } else {
      setSelectedParcelForDossier(parcel);
    }
  };

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
      key: 'state',
      header: 'Jurisdiction Scope',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-slate-800 font-semibold">{row.district}, {row.state}</p>
          <p className="text-[11px] text-slate-500 font-mono">Taluk: {row.taluk} | {row.village}</p>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: '1. Revenue (RoR)',
      render: (row) => (
        <PillarPill
          pillar="REV"
          status={row.verificationMatrix.revenue?.status || 'PENDING'}
          onClick={() => handlePillarClick(row, 'revenue')}
        />
      ),
    },
    {
      key: 'survey',
      header: '2. Survey (GIS)',
      render: (row) => (
        <PillarPill
          pillar="SUR"
          status={row.verificationMatrix.survey?.status || 'PENDING'}
          onClick={() => handlePillarClick(row, 'survey')}
        />
      ),
    },
    {
      key: 'registration',
      header: '3. Registration',
      render: (row) => (
        <PillarPill
          pillar="REG"
          status={row.verificationMatrix.registration?.status || 'PENDING'}
          onClick={() => handlePillarClick(row, 'registration')}
        />
      ),
    },
    {
      key: 'municipality',
      header: '4. Municipality',
      render: (row) => (
        <PillarPill
          pillar="MUN"
          status={row.verificationMatrix.municipality?.status || 'PENDING'}
          onClick={() => handlePillarClick(row, 'municipality')}
        />
      ),
    },
    {
      key: 'overallStatus',
      header: 'Workflow State',
      sortable: true,
      render: (row) => <StatusBadge status={row.overallStatus} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {isTahsildar && (
            <button
              type="button"
              onClick={() => setSelectedParcelForDossier(row)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              Review Dossier
            </button>
          )}

          {isSurveyor && row.verificationMatrix.survey?.status !== 'VERIFIED' && row.overallStatus !== 'LAND_VERIFIED' && (
            <button
              type="button"
              onClick={() => setSurveyorTargetParcel(row)}
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
            >
              Demarcate GIS
            </button>
          )}

          {isSubRegistrar && row.verificationMatrix.registration?.status !== 'VERIFIED' && row.overallStatus !== 'LAND_VERIFIED' && (
            <button
              type="button"
              onClick={() => setSubRegistrarTargetParcel(row)}
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
            >
              Deed Transfer
            </button>
          )}

          {isRevenueOfficer && row.verificationMatrix.municipality?.status !== 'VERIFIED' && row.overallStatus !== 'LAND_VERIFIED' && (
            <button
              type="button"
              onClick={() => setMunicipalTargetParcel(row)}
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
            >
              Clear Tax
            </button>
          )}

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setSelectedParcelForDossier(row)}
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Review Clearances
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/governance/digital-twins/${row.landId}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
            title="View GIS Map & Parcel Details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Land Governance' }, { label: 'Land Clearance & Approvals' }]} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black text-white font-mono">
              OFFICER: {currentUser.role.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Department: {currentUser.departmentName}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Department Land Verification Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official 4-department clearance: Tahsildar (Land Record) → Cadastral Surveyor (Field Demarcation) → Sub-Registrar (Title Deed Registration) → Municipal Officer (Property Tax Assessment).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isTahsildar && (
            <button
              type="button"
              onClick={() => setIsCreateParcelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Land Parcel</span>
            </button>
          )}

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="text-slate-900 font-bold px-1">4 Pillars:</span>
            <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-mono font-bold border border-slate-200">Revenue</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-mono font-bold border border-slate-200">Survey</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-mono font-bold border border-slate-200">Registration</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-mono font-bold border border-slate-200">Municipality</span>
          </div>
        </div>
      </div>

      {/* Filters & Data Table */}
      <DataTable
        data={displayedParcels}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search Land ID (TN-101), Survey #, Owner..."
        searchKey={(row) => `${row.landId} ${row.surveyNumber} ${row.currentOwnerName} ${row.district} ${row.state} ${row.taluk} ${row.village} ${row.landType} ${row.overallStatus}`}
        exportFileName="land_verification_matrix"
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Workflow States</option>
              <option value="LAND_VERIFIED">LAND_VERIFIED (4-Tier)</option>
              <option value="REQUIRES_SURVEY">REQUIRES_SURVEY</option>
              <option value="REQUIRES_REGISTRATION_VERIFICATION">REQUIRES_REGISTRATION_VERIFICATION</option>
              <option value="REQUIRES_MUNICIPAL_VERIFICATION">REQUIRES_MUNICIPAL_VERIFICATION</option>
              <option value="REJECTED">REJECTED / DISPUTED</option>
            </select>

            <select
              value={landTypeFilter}
              onChange={(e) => setLandTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Land Types</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>
        }
      />

      {/* Workflow Modals */}
      {isCreateParcelModalOpen && (
        <CreateLandParcelModal
          isOpen={isCreateParcelModalOpen}
          onClose={() => setIsCreateParcelModalOpen(false)}
          onSuccessCreated={(id) => navigate(`/governance/digital-twins/${id}`)}
        />
      )}

      {surveyorTargetParcel && (
        <SurveyorGISDrawer
          isOpen={Boolean(surveyorTargetParcel)}
          onClose={() => setSurveyorTargetParcel(null)}
          parcel={surveyorTargetParcel}
        />
      )}

      {subRegistrarTargetParcel && (
        <SubRegistrarTransferModal
          isOpen={Boolean(subRegistrarTargetParcel)}
          onClose={() => setSubRegistrarTargetParcel(null)}
          parcel={subRegistrarTargetParcel}
        />
      )}

      {municipalTargetParcel && (
        <MunicipalVerificationDrawer
          isOpen={Boolean(municipalTargetParcel)}
          onClose={() => setMunicipalTargetParcel(null)}
          parcel={municipalTargetParcel}
        />
      )}

      {/* General Inspection Dossier Drawer */}
      {selectedParcelForDossier && (
        <Drawer
          isOpen={Boolean(selectedParcelForDossier)}
          onClose={() => setSelectedParcelForDossier(null)}
          title={`Verification Ledger: ${selectedParcelForDossier.landId}`}
          subtitle={`Survey No: ${selectedParcelForDossier.surveyNumber} • ${selectedParcelForDossier.district}, ${selectedParcelForDossier.state}`}
          width="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Current Owner: {selectedParcelForDossier.currentOwnerName}</span>
                <StatusBadge status={selectedParcelForDossier.overallStatus} />
              </div>
              <p className="text-slate-600 font-mono">
                Extent: {selectedParcelForDossier.areaInAcres} Acres • Zoning: {selectedParcelForDossier.landType}
              </p>
            </div>

            {/* 4 Normalized Verification Cards */}
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Departmental Verification Ledger (Table: LAND_VERIFICATION)
            </h4>

            <div className="space-y-2.5">
              {[
                { title: '1. Revenue / Land Records', key: 'revenue', data: selectedParcelForDossier.verificationMatrix.revenue },
                { title: '2. Survey & Land Records (GIS)', key: 'survey', data: selectedParcelForDossier.verificationMatrix.survey },
                { title: '3. Registration & Stamps', key: 'registration', data: selectedParcelForDossier.verificationMatrix.registration },
                { title: '4. Municipality / Local Body', key: 'municipality', data: selectedParcelForDossier.verificationMatrix.municipality },
              ].map((p) => (
                <div key={p.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    <StatusBadge status={p.data.status} size="sm" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">{p.data.comments || 'Pending officer action'}</p>
                  {p.data.verifiedBy && (
                    <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                      Signed: <strong>{p.data.verifiedBy}</strong> at {p.data.verifiedAt ? new Date(p.data.verifiedAt).toLocaleString() : 'N/A'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
