import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  MapPin, 
  Layers, 
  FileText, 
  AlertTriangle, 
  History, 
  Database, 
  Download, 
  Building2, 
  Compass, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Network,
  Receipt,
  UserCheck
} from 'lucide-react';
import { useDigitalTwin, useNormalizedVerifications } from '../hooks/useQueries';
import { Breadcrumbs, Tabs } from '../components/common/Breadcrumbs';
import { StatusBadge } from '../components/common/StatusBadge';
import { GISMapViewer } from '../components/common/GISMapViewer';
import { Neo4jGraphViewer } from '../components/common/Neo4jGraphViewer';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { SurveyorGISDrawer } from '../components/workflow/SurveyorGISDrawer';
import { SubRegistrarTransferModal } from '../components/workflow/SubRegistrarTransferModal';
import { MunicipalVerificationDrawer } from '../components/workflow/MunicipalVerificationDrawer';

export const DigitalTwinDetailPage: React.FC = () => {
  const { landId } = useParams<{ landId: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { currentUser, isSuperAdmin, isSurveyor, isSubRegistrar, isRevenueOfficer } = useAuth();

  const [activeTab, setActiveTab] = useState('gis_map');
  const [isSurveyDrawerOpen, setIsSurveyDrawerOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMunicipalDrawerOpen, setIsMunicipalDrawerOpen] = useState(false);

  const { data: parcel, isLoading } = useDigitalTwin(landId || '');
  const { data: verifications } = useNormalizedVerifications(landId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-44 bg-white rounded-3xl border border-slate-200"></div>
        <div className="h-96 bg-white rounded-3xl border border-slate-200"></div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Digital Twin Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          No cadastral digital twin exists with Land ID <code className="text-black font-bold">{landId}</code>.
        </p>
        <button
          onClick={() => navigate('/governance/digital-twins')}
          className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Land Governance', href: '/governance/verification' },
          { label: 'Digital Twins', href: '/governance/digital-twins' },
          { label: parcel.landId },
        ]}
      />

      {/* Back Button & Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-black font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous view</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            GeoServer Layer: <strong className="text-slate-800">{parcel.geoServerLayerName}</strong>
          </span>
        </div>
      </div>

      {/* Dossier Hero Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-900 border border-slate-300">
                {parcel.landId}
              </span>
              <StatusBadge status={parcel.overallStatus} size="md" />
              <StatusBadge status={parcel.landType} size="md" showIcon={false} />
              {parcel.isDisputed && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> LITIGATION ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Survey No: {parcel.surveyNumber}
              {parcel.subDivisionNumber && <span className="text-slate-500"> (Sub-Div: {parcel.subDivisionNumber})</span>}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-1.5 font-medium">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {parcel.village}, {parcel.taluk}, {parcel.district}, {parcel.state}, India
              </span>
            </p>
          </div>

          {/* Key Metric Highlights & Workflow Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Extent</span>
                <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                  {parcel.areaInAcres} <span className="text-xs text-slate-500">Acres</span>
                </p>
                <p className="text-[10px] text-slate-500 font-mono">{parcel.areaInSqMeters.toLocaleString()} m²</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Market Value (Govt)</span>
                <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
                  ₹{(parcel.marketValueINR / 10000000).toFixed(2)} Cr
                </p>
                <p className="text-[10px] text-slate-500">Guide Value Ready</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Encumbrance</span>
                <p className={`text-base font-bold mt-0.5 ${
                  parcel.encumbranceStatus === 'FREE' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {parcel.encumbranceStatus}
                </p>
                <p className="text-[10px] text-slate-500">Tax Clear Upto {parcel.taxClearanceUptoYear}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">Current Title Holder:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-bold border border-slate-200">
              {parcel.currentOwnerName}
            </span>
            <span className="text-slate-500 font-mono">({parcel.currentOwnerIdHash})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(isSurveyor || isSuperAdmin) && parcel.verificationMatrix.survey?.status !== 'VERIFIED' && parcel.overallStatus !== 'LAND_VERIFIED' && (
              <button
                type="button"
                onClick={() => setIsSurveyDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Demarcate PostGIS Boundary</span>
              </button>
            )}

            {(isSubRegistrar || isSuperAdmin) && parcel.verificationMatrix.registration?.status !== 'VERIFIED' && parcel.overallStatus !== 'LAND_VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  if (parcel.verificationMatrix.survey?.status !== 'VERIFIED') {
                    toastError(
                      'Survey Verification Required',
                      `Land parcel ${parcel.landId} must be verified by the Survey Department (DGPS boundary) before the Sub-Registrar can register title deeds.`
                    );
                    return;
                  }
                  setIsTransferModalOpen(true);
                }}
                disabled={parcel.verificationMatrix.survey?.status !== 'VERIFIED'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
                  parcel.verificationMatrix.survey?.status === 'VERIFIED'
                    ? 'bg-black hover:bg-slate-800 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
                title={
                  parcel.verificationMatrix.survey?.status !== 'VERIFIED'
                    ? 'Survey verification required first'
                    : 'Execute Sub-Registrar deed registration'
                }
              >
                <Network className="w-3.5 h-3.5" />
                <span>Execute Title Transfer</span>
                {parcel.verificationMatrix.survey?.status !== 'VERIFIED' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">
                    Awaiting Survey
                  </span>
                )}
              </button>
            )}

            {(isRevenueOfficer || isSuperAdmin) && parcel.verificationMatrix.municipality?.status !== 'VERIFIED' && parcel.overallStatus !== 'LAND_VERIFIED' && (
              <button
                type="button"
                onClick={() => setIsMunicipalDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Assess Municipal Tax</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Pillar Verification Status Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">1. Revenue (RoR)</span>
                <StatusBadge status={parcel.verificationMatrix.revenue.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {parcel.verificationMatrix.revenue.comments || 'Pending RoR review'}
              </p>
            </div>

            <div
              onClick={() => (isSurveyor || isSuperAdmin) && setIsSurveyDrawerOpen(true)}
              className={`p-3 rounded-xl bg-slate-50 border border-slate-200 transition-colors ${
                isSurveyor || isSuperAdmin ? 'hover:border-black cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">2. Survey & GIS</span>
                <StatusBadge status={parcel.verificationMatrix.survey.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {parcel.verificationMatrix.survey.comments || 'Pending DGPS Demarcation'}
              </p>
            </div>

            <div
              onClick={() => (isSubRegistrar || isSuperAdmin) && setIsTransferModalOpen(true)}
              className={`p-3 rounded-xl bg-slate-50 border border-slate-200 transition-colors ${
                isSubRegistrar || isSuperAdmin ? 'hover:border-black cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">3. Registration</span>
                <StatusBadge status={parcel.verificationMatrix.registration.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {parcel.verificationMatrix.registration.comments || 'Pending SRO Deed Review'}
              </p>
            </div>

            <div
              onClick={() => (isRevenueOfficer || isSuperAdmin) && setIsMunicipalDrawerOpen(true)}
              className={`p-3 rounded-xl bg-slate-50 border border-slate-200 transition-colors ${
                isRevenueOfficer || isSuperAdmin ? 'hover:border-black cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">4. Municipality</span>
                <StatusBadge status={parcel.verificationMatrix.municipality.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {parcel.verificationMatrix.municipality.comments || 'Pending Property Tax Check'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={[
          { id: 'gis_map', label: 'Land Map & Boundaries', icon: <Compass className="w-4 h-4" /> },
          { id: 'neo4j_lineage', label: 'Ownership History & Title Deeds', icon: <History className="w-4 h-4" /> },
          { id: 'verifications', label: 'Department Clearances', count: 4, icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'dossier_meta', label: 'Land Classification & Details', icon: <Building2 className="w-4 h-4" /> },
          { id: 'documents', label: 'Attached Documents & Deeds', count: parcel.linkedDocuments?.length || 0, icon: <FileText className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: GIS Map View */}
      {activeTab === 'gis_map' && (
        <div className="space-y-4">
          <GISMapViewer
            gisBoundary={parcel.gisBoundary}
            landId={parcel.landId}
            surveyNumber={parcel.surveyNumber}
            areaInAcres={parcel.areaInAcres}
            geoServerLayerName={parcel.geoServerLayerName}
            postGisTable={parcel.postGisTable}
            elevationMeters={parcel.elevationMeters}
            height="520px"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 font-mono shadow-2xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Cadastral Record</span>
              <p className="text-slate-900 font-bold">{parcel.landId}</p>
              <p className="text-slate-500 text-[11px]">Official Survey Record</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 font-mono shadow-2xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Survey Map Layer</span>
              <p className="text-slate-900 font-bold">{parcel.geoServerLayerName}</p>
              <p className="text-slate-500 text-[11px]">DGPS Demarcated Boundary</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 font-mono shadow-2xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Survey Precision</span>
              <p className="text-emerald-700 font-bold">DGPS Accurate</p>
              <p className="text-slate-500 text-[11px]">Standard Cadastral Datum</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ownership History & Title Deeds */}
      {activeTab === 'neo4j_lineage' && (
        <Neo4jGraphViewer lineage={parcel.ownershipLineage || []} landId={parcel.landId} />
      )}

      {/* Tab 3: Department Clearances Table */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Verification & Clearances
              </h3>
              <p className="text-xs text-slate-500">
                Official verification signatures, review comments, and approval timestamps across all 4 departments.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-bold">Department Silo</th>
                  <th className="py-3 px-3.5 font-bold">Verifying Officer</th>
                  <th className="py-3 px-3.5 font-bold">Clearance Status</th>
                  <th className="py-3 px-3.5 font-bold">Remarks & Findings</th>
                  <th className="py-3 px-3.5 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(verifications || []).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-slate-900 font-sans">{v.departmentName}</span>
                      <p className="text-[10px] text-slate-500">{v.departmentCode}</p>
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="font-semibold text-slate-900 font-sans">{v.officerName}</p>
                      <p className="text-[10px] text-slate-500">{v.officerDesignation}</p>
                    </td>
                    <td className="py-3 px-3.5 font-sans">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 font-sans max-w-sm">
                      <p className="text-slate-700 truncate">{v.remarks}</p>
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                      {v.verifiedAt ? new Date(v.verifiedAt).toLocaleString() : 'PENDING'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Physical & Zoning Attributes */}
      {activeTab === 'dossier_meta' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              Master Plan & Zoning Regulations
            </h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Master Plan Zoning:</span>
                <span className="text-slate-900 font-semibold">{parcel.landUseZoning}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Land Classification:</span>
                <span className="text-slate-900 font-semibold">{parcel.landType}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Property Tax Assessment:</span>
                <span className="text-emerald-700 font-semibold">Cleared through FY {parcel.taxClearanceUptoYear}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Encumbrance Status:</span>
                <span className="text-slate-900 font-semibold">{parcel.encumbranceStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-700" />
              Terrain & Environmental Twin Data
            </h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Mean Sea Level Elevation:</span>
                <span className="text-slate-900 font-semibold">{parcel.elevationMeters} Meters MSL</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Soil Pedology Classification:</span>
                <span className="text-slate-900 font-semibold">{parcel.soilClassification}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Cadastral Division:</span>
                <span className="text-slate-900 font-semibold">Taluk {parcel.taluk} (Ward #{parcel.village})</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Litigation Advisory:</span>
                <span className={parcel.isDisputed ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                  {parcel.isDisputed ? parcel.disputeDetails : 'Nil Court Disputes Reported'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Linked Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Certified Legal Deeds & Spatial GeoPackages (S3 Vault)
            </h3>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-black font-bold hover:underline"
            >
              Upload Additional Deed →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(parcel.linkedDocuments || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No deeds currently uploaded for this parcel. All registered records can be managed in the Documents module.
              </p>
            ) : (
              (parcel.linkedDocuments || []).map((doc) => (
                <div key={doc.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.documentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Type: {doc.documentType} • Size: {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.verificationStatus} size="sm" />
                    <button
                      onClick={() => success('Download Started', `Fetching ${doc.documentName} from S3/MinIO vault.`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
                      title="Download Certified PDF/GeoPackage"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workflow Modals */}
      {isSurveyDrawerOpen && (
        <SurveyorGISDrawer
          isOpen={isSurveyDrawerOpen}
          onClose={() => setIsSurveyDrawerOpen(false)}
          parcel={parcel}
        />
      )}

      {isTransferModalOpen && (
        <SubRegistrarTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          parcel={parcel}
        />
      )}

      {isMunicipalDrawerOpen && (
        <MunicipalVerificationDrawer
          isOpen={isMunicipalDrawerOpen}
          onClose={() => setIsMunicipalDrawerOpen(false)}
          parcel={parcel}
        />
      )}
    </div>
  );
};
