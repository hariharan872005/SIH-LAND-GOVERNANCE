import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  Users, 
  Building2, 
  Layers, 
  FileCheck, 
  ShieldAlert, 
  Globe2,
  Activity,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Compass,
  Network,
  Receipt,
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboardStats, useLandParcels } from '../hooks/useQueries';
import { StatCard } from '../components/common/Breadcrumbs';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAdminScope } from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { CreateLandParcelModal } from '../components/workflow/CreateLandParcelModal';
import { SurveyorGISDrawer } from '../components/workflow/SurveyorGISDrawer';
import { SubRegistrarTransferModal } from '../components/workflow/SubRegistrarTransferModal';
import { MunicipalVerificationDrawer } from '../components/workflow/MunicipalVerificationDrawer';
import { DigitalTwinDetail } from '../types';

const LAND_TYPE_COLORS: Record<string, string> = {
  COMMERCIAL: '#000000',
  AGRICULTURAL: '#475569',
  RESIDENTIAL: '#64748b',
  INDUSTRIAL: '#94a3b8',
  GOVERNMENT: '#334155',
  FOREST: '#1e293b',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState } = useAdminScope();
  const { currentUser, isSuperAdmin, isTahsildar, isSurveyor, isSubRegistrar, isRevenueOfficer } = useAuth();
  
  const { data: stats } = useDashboardStats();
  const { data: parcels } = useLandParcels({
    state: isSuperAdmin ? (selectedState === 'ALL' ? undefined : selectedState) : currentUser.scope.state,
    taluk: !isSuperAdmin ? currentUser.scope.taluk : undefined,
  });

  // Workflow Dialog States
  const [isCreateParcelModalOpen, setIsCreateParcelModalOpen] = useState(false);
  const [surveyorTargetParcel, setSurveyorTargetParcel] = useState<DigitalTwinDetail | null>(null);
  const [subRegistrarTargetParcel, setSubRegistrarTargetParcel] = useState<DigitalTwinDetail | null>(null);
  const [municipalTargetParcel, setMunicipalTargetParcel] = useState<DigitalTwinDetail | null>(null);

  const filteredStats = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black text-white font-mono">
              {currentUser.role.replace('_', ' ')} WORKSPACE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              {currentUser.name} ({currentUser.departmentName})
            </span>
            {!isSuperAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 font-mono">
                Taluk: {currentUser.scope.taluk}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSuperAdmin && 'National Land Administration & Governance Portal'}
            {isTahsildar && 'Tahsildar Land Registry & Parcel Creation'}
            {isSurveyor && 'Cadastral Survey & Boundary Demarcation'}
            {isSubRegistrar && 'Sub-Registrar Deed Registration & Ownership Transfers'}
            {isRevenueOfficer && 'Property Tax Assessment & Revenue Clearance'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            {isSuperAdmin && 'National land governance summary, cross-department verification tracking, and official audit log records.'}
            {isTahsildar && `Register new land parcel records in ${currentUser.scope.taluk} Taluk to forward for survey boundary demarcation.`}
            {isSurveyor && `Review pending field surveys in ${currentUser.scope.taluk} Taluk, mark boundary coordinates, and submit for registration verification.`}
            {isSubRegistrar && `Verify registered sale deeds, authenticate ownership transfers, and update title records for land parcels.`}
            {isRevenueOfficer && `Assess municipal property tax, verify assessment records, and grant final clearance for verified land parcels.`}
          </p>
        </div>

        {/* Primary Role Action CTAs */}
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

          {isSurveyor && (
            <button
              type="button"
              onClick={() => {
                const pendingSurvey = parcels?.find((p) => p.overallStatus === 'REQUIRES_SURVEY') || parcels?.[0];
                if (pendingSurvey) setSurveyorTargetParcel(pendingSurvey);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Demarcate Assigned Survey</span>
            </button>
          )}

          {isSubRegistrar && (
            <button
              type="button"
              onClick={() => {
                const target = parcels?.find((p) => p.overallStatus === 'REQUIRES_REGISTRATION_VERIFICATION') || parcels?.[0];
                if (target) setSubRegistrarTargetParcel(target);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span>Register Ownership Transfer</span>
            </button>
          )}

          {isRevenueOfficer && (
            <button
              type="button"
              onClick={() => {
                const target = parcels?.find((p) => p.overallStatus === 'REQUIRES_MUNICIPAL_VERIFICATION') || parcels?.[0];
                if (target) setMunicipalTargetParcel(target);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Municipal Tax Clearance</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/governance/digital-twins')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Digital Twin Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title={isSuperAdmin ? 'Total Land Parcels' : `Parcels in ${currentUser.scope.taluk || 'Jurisdiction'}`}
          value={parcels?.length || filteredStats?.totalParcels || 18456}
          subtitle="Registered in National Cadastre"
          icon={<Globe2 className="w-6 h-6" />}
          trend={{ value: '12.4% vs last month', isPositive: true }}
        />

        <StatCard
          title="4-Tier Fully Verified"
          value={parcels?.filter((p) => p.overallStatus === 'LAND_VERIFIED').length || 14202}
          subtitle="Revenue + Survey + Reg + Muni"
          icon={<FileCheck className="w-6 h-6" />}
          trend={{ value: '100% 4-Pillar Clearance', isPositive: true }}
        />

        <StatCard
          title="Pending Departmental Stage"
          value={parcels?.filter((p) => p.overallStatus !== 'LAND_VERIFIED' && p.overallStatus !== 'REJECTED').length || 3612}
          subtitle="In Multi-Stage Workflow"
          icon={<Clock className="w-6 h-6" />}
          trend={{ value: 'Requires Department Action' }}
        />

        <StatCard
          title="Disputed / Correction Req."
          value={parcels?.filter((p) => p.overallStatus === 'REJECTED' || p.overallStatus === 'REQUIRES_CORRECTION' || p.isDisputed).length || 124}
          subtitle="Court injunctions & title flags"
          icon={<ShieldAlert className="w-6 h-6" />}
        />
      </div>

      {/* Role-Specific Pipeline Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-black" />
              {isTahsildar && 'Tahsildar Jurisdiction Parcels & Pipeline Status'}
              {isSurveyor && 'Assigned Cadastral Surveys & PostGIS Demarcation Queue'}
              {isSubRegistrar && 'Pending Deed Registrations & Conveyance Queue'}
              {isRevenueOfficer && 'Municipal Assessment & Property Tax Clearance Queue'}
              {isSuperAdmin && 'National 4-Pillar Land Verification Workflow Queue'}
            </h3>
            <p className="text-xs text-slate-500">
              Real-time multi-stage verification state machine synchronized with PostgreSQL, PostGIS & Neo4j.
            </p>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{parcels?.length || 0}</strong> active parcels
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-bold">Land ID / Survey #</th>
                <th className="py-3 px-3.5 font-bold">Title Holder & Extent</th>
                <th className="py-3 px-3.5 font-bold">Jurisdiction</th>
                <th className="py-3 px-3.5 font-bold">Workflow State</th>
                <th className="py-3 px-3.5 font-bold text-right">Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(parcels || []).slice(0, 8).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3.5">
                    <p className="font-extrabold text-slate-900">{p.landId}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Survey #{p.surveyNumber}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-slate-900">{p.currentOwnerName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{p.areaInAcres} Acres ({p.landType})</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="text-slate-800">{p.village}, {p.taluk}</p>
                    <p className="text-[10px] text-slate-500">{p.district}, {p.state}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={p.overallStatus} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {isTahsildar && (
                      <button
                        type="button"
                        onClick={() => navigate(`/governance/digital-twins/${p.landId}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-black hover:text-white border border-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    )}

                    {isSurveyor && p.verificationMatrix?.survey?.status !== 'VERIFIED' && p.overallStatus !== 'LAND_VERIFIED' && (
                      <button
                        type="button"
                        onClick={() => setSurveyorTargetParcel(p)}
                        className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-slate-800 text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Demarcate PostGIS
                      </button>
                    )}

                    {isSubRegistrar && p.verificationMatrix?.registration?.status !== 'VERIFIED' && p.overallStatus !== 'LAND_VERIFIED' && (
                      <button
                        type="button"
                        onClick={() => setSubRegistrarTargetParcel(p)}
                        className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-slate-800 text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Transfer Title
                      </button>
                    )}

                    {isRevenueOfficer && p.verificationMatrix?.municipality?.status !== 'VERIFIED' && p.overallStatus !== 'LAND_VERIFIED' && (
                      <button
                        type="button"
                        onClick={() => setMunicipalTargetParcel(p)}
                        className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-slate-800 text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Assess Tax / Bldg
                      </button>
                    )}

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => navigate(`/governance/digital-twins/${p.landId}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-black hover:text-white border border-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Audit Digital Twin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Verification Trends AreaChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cadastral Verification Throughput Velocity (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Monthly workflow clearances across Revenue, Survey, Registration & Municipality.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-black"></span> Verified
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Pending
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Rejected
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredStats?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  stroke="#000000"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                  name="Verified"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#64748b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPending)"
                  name="Pending"
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRejected)"
                  name="Rejected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Land Classification Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Land Zoning Classification</h3>
            <p className="text-xs text-slate-500">Spatial extent distribution by zoning type.</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredStats?.landTypeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="type"
                >
                  {(filteredStats?.landTypeDistribution || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={LAND_TYPE_COLORS[entry.type] || '#000000'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            {(filteredStats?.landTypeDistribution || []).map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: LAND_TYPE_COLORS[item.type] || '#000000' }}
                ></span>
                <span className="text-slate-700 font-medium truncate">{item.type}</span>
                <span className="text-slate-400 font-mono ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Pillar Department Progress Stacked Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Departmental Clearance Status Across 4 Pillars
            </h3>
            <p className="text-xs text-slate-500">
              Normalized verification distribution: Revenue (RoR), Survey (DGPS), Registration (SRO Deed), Municipality (Tax).
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Single Normalized DB Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {(filteredStats?.departmentVerificationRate || []).map((dept) => {
            const total = dept.verified + dept.pending + dept.rejected;
            const verifiedPct = total > 0 ? Math.round((dept.verified / total) * 100) : 100;

            return (
              <div
                key={dept.department}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{dept.department}</h4>
                  <span className="text-xs font-mono font-bold text-black">{verifiedPct}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${verifiedPct}%` }} className="bg-black h-full"></div>
                  <div
                    style={{
                      width: `${total > 0 ? Math.round((dept.pending / total) * 100) : 0}%`,
                    }}
                    className="bg-slate-400 h-full"
                  ></div>
                  <div
                    style={{
                      width: `${total > 0 ? Math.round((dept.rejected / total) * 100) : 0}%`,
                    }}
                    className="bg-slate-300 h-full"
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <span>✓ {dept.verified} Cleared</span>
                  <span>⏳ {dept.pending} Pending</span>
                  <span>✗ {dept.rejected} Flagged</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
};
