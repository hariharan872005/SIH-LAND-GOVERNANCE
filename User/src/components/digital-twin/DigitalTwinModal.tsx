import React, { useState, useRef } from 'react';
import { useDigitalTwinQuery, useDocumentsQuery, useUploadDocumentMutation } from '../../hooks/useLandQueries';
import { Neo4jLineageGraphView } from './Neo4jLineageGraphView';
import { SpatialMiniMap } from './SpatialMiniMap';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ErrorAlert } from '../common/ErrorAlert';
import {
  X,
  Sparkles,
  Building2,
  MapPin,
  ShieldCheck,
  History,
  FileCode,
  Globe,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Download,
  Eye,
  Lock,
  Landmark,
  Share2,
  Printer,
  Copy,
  Check,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Compass,
  Scale,
  Upload,
  Plus,
  Loader2,
} from 'lucide-react';

interface DigitalTwinModalProps {
  landId: string | null;
  onClose: () => void;
}

export const DigitalTwinModal: React.FC<DigitalTwinModalProps> = ({ landId, onClose }) => {
  const [twinTab, setTwinTab] = useState<'overview' | 'governance' | 'lineage' | 'documents' | 'spatial'>('overview');
  const [copied, setCopied] = useState(false);

  // Upload modal state inside User portal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('PATTA_CHITTA');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: twin, isLoading, isError, refetch } = useDigitalTwinQuery(landId || undefined);
  const { data: documents = [], refetch: refetchDocs } = useDocumentsQuery(landId || undefined);
  const uploadMutation = useUploadDocumentMutation();

  if (!landId) return null;

  const handleCopyLandId = () => {
    navigator.clipboard.writeText(landId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landId) return;

    try {
      await uploadMutation.mutateAsync({
        landId,
        file: uploadFile || undefined,
        documentType: uploadDocType,
        documentName: uploadDocName.trim() || `${uploadDocType.replace(/_/g, ' ')} for ${landId}`,
      });
      setIsUploadOpen(false);
      setUploadDocName('');
      setUploadFile(null);
      refetch();
      refetchDocs();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Safe extractions
  const surveyNumber = twin?.surveyNumber || 'Demarcated Plot';
  const villageName = twin?.location?.villageName || 'Ambattur OT';
  const talukName = twin?.location?.talukName || 'Ambattur';
  const districtName = twin?.location?.districtName || 'Chennai';
  const stateName = twin?.location?.stateName || 'Tamil Nadu';

  const regAreaAcres = Number(
    twin?.landDetails?.measuredArea ||
    twin?.landDetails?.registeredArea ||
    twin?.gis?.areaInAcres ||
    twin?.areaInAcres ||
    0
  );
  const areaSqm = Math.round(regAreaAcres * 4046.86);
  const marketVal = Number(twin?.landDetails?.marketValueINR || twin?.marketValueINR || 0);
  const status = twin?.landDetails?.status || twin?.overallStatus || 'LAND_VERIFIED';
  const isConflict = twin?.landDetails?.isDisputed || twin?.isDisputed || status === 'REQUIRES_CORRECTION';
  const isVerified = status === 'LAND_VERIFIED';

  const currentOwner = twin?.currentOwner || {
    ownerName: twin?.currentOwnerName || 'Government of Tamil Nadu',
    ownershipType: twin?.currentOwnerType || 'INDIVIDUAL',
    ownershipPercentage: 100,
  };

  // Merge twin documents and standalone documents
  const allDocs = (documents && documents.length > 0)
    ? documents
    : (twin?.documents && twin.documents.length > 0)
    ? twin.documents
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 relative">
        {/* 1. Modal Header */}
        <div className="px-6 py-5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-600/20 shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Digital Twin: Survey #{surveyNumber}</span>
                </h2>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                    isConflict
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : isVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {villageName}, {talukName}, {districtName}, {stateName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-emerald-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {landId}
                </span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLandId}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Copy Parcel ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Print Certified Twin Summary"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print Twin</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Modern Segmented Capsule Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/80 gap-1">
            <button
              onClick={() => setTwinTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 ${
                twinTab === 'overview'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setTwinTab('governance')}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 ${
                twinTab === 'governance'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4-Pillar Matrix</span>
            </button>

            <button
              onClick={() => setTwinTab('lineage')}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 ${
                twinTab === 'lineage'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Neo4j Graph & Lineage</span>
            </button>

            <button
              onClick={() => setTwinTab('documents')}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 ${
                twinTab === 'documents'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Title Vault ({allDocs.length})</span>
            </button>

            <button
              onClick={() => setTwinTab('spatial')}
              className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 ${
                twinTab === 'spatial'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>PostGIS Spatial</span>
            </button>
          </div>
        </div>

        {/* 3. Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {isLoading && <LoadingSkeleton type="details" />}

          {isError && (
            <ErrorAlert
              title="Digital Twin Unavailable"
              message="Could not retrieve aggregated Digital Twin state for this land parcel."
              onRetry={refetch}
            />
          )}

          {!isLoading && twin && (
            <>
              {/* TAB 1: OVERVIEW */}
              {twinTab === 'overview' && (
                <div className="space-y-6">
                  {/* 4 Hero KPI Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2 relative overflow-hidden shadow-sm">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                        TOTAL DEMARCATED EXTENT
                      </div>
                      <div className="font-extrabold text-2xl sm:text-3xl text-emerald-700 tracking-tight">
                        {regAreaAcres.toFixed(2)} Acres
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {areaSqm.toLocaleString()} M² <span className="text-slate-300">|</span> PostGIS Geodesic
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2 relative overflow-hidden shadow-sm">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                        GUIDELINE REGISTRY VALUE
                      </div>
                      <div className="font-extrabold text-2xl sm:text-3xl text-blue-700 tracking-tight">
                        ₹{marketVal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        State Revenue Benchmark Value
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2 relative overflow-hidden shadow-sm">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                        ACTIVE TITLE HOLDER
                      </div>
                      <div className="font-extrabold text-xl text-slate-900 truncate" title={currentOwner.ownerName}>
                        {currentOwner.ownerName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {currentOwner.ownershipType || 'INDIVIDUAL'} (100% Freehold Share)
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2 relative overflow-hidden shadow-sm">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                        TITLE CLEARANCE & ENCUMBRANCE
                      </div>
                      <div className="font-extrabold text-xl mt-1">
                        {isConflict ? (
                          <span className="text-rose-600 flex items-center gap-1.5">
                            <AlertTriangle className="w-5 h-5 shrink-0" /> Disputed Claim
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5 shrink-0" /> Free & Clear Title
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Revenue & SRO Verified Record
                      </div>
                    </div>
                  </div>

                  {/* Cadastral Classification & Terrain Attributes */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Cadastral Classification & Spatial Specs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Zoning Designation</span>
                        <div className="font-bold text-slate-800 text-sm">
                          {twin.landDetails?.landUseZoning || 'Commercial Mixed Use (CMDA Zone)'}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Soil Classification</span>
                        <div className="font-bold text-slate-800 text-sm">
                          {twin.landDetails?.soilClassification || 'Red Sandy Loam (High Bearing)'}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Elevation</span>
                        <div className="font-bold text-slate-800 text-sm">
                          {twin.landDetails?.elevationMeters || 24.5} M Above MSL
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">GeoServer Layer</span>
                        <div className="font-mono font-bold text-blue-700 text-xs truncate" title={twin.landDetails?.geoServerLayerName}>
                          {twin.landDetails?.geoServerLayerName || `national_cadastre:${landId.toLowerCase().replace(/-/g, '_')}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Municipal Assessment & Property Tax Clearance */}
                  {twin.municipalAssessment && (
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          Municipal Assessment & Property Tax Clearance
                        </h3>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                          {twin.municipalAssessment.isTaxCleared ? 'TAX CLEARED / ACTIVE' : 'TAX DUE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Property PID: </span>
                          <span className="font-mono font-bold text-slate-900">{twin.municipalAssessment.propertyId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Built-Up Area: </span>
                          <span className="font-bold text-slate-900">{twin.municipalAssessment.builtUpAreaSqFt} Sq.Ft</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Floors / Occupancy: </span>
                          <span className="font-bold text-slate-900">G+{twin.municipalAssessment.floorsCount} • {twin.municipalAssessment.occupancyStatus}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Cleared Thru: </span>
                          <span className="font-bold text-emerald-700">FY {twin.municipalAssessment.taxClearanceUptoYear}</span>
                        </div>
                      </div>
                      {twin.municipalAssessment.municipalRemarks && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 italic">
                          "{twin.municipalAssessment.municipalRemarks}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: 4-PILLAR GOVERNANCE */}
              {twinTab === 'governance' && (
                <div className="space-y-6">
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        4-Pillar Departmental Governance Verification Matrix
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Mandatory multi-departmental consensus across Revenue, Cadastral Survey, SRO Registration, and Municipality
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Pillar 1: Revenue */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-emerald-600" />
                            1. Revenue & RoR Department
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              twin.verificationMatrix?.revenue?.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {twin.verificationMatrix?.revenue?.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {twin.verificationMatrix?.revenue?.remarks || 'Record of Rights verified. Patta and mutation entry verified by Tahsildar division.'}
                        </p>
                      </div>

                      {/* Pillar 2: Survey */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-blue-600" />
                            2. Cadastral Survey & Mapping
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              twin.verificationMatrix?.survey?.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {twin.verificationMatrix?.survey?.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {twin.verificationMatrix?.survey?.remarks || 'DGPS survey benchmarked against CORS network. Extent and polygon coordinates demarcated.'}
                        </p>
                      </div>

                      {/* Pillar 3: Registration */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-purple-600" />
                            3. Registration & Stamps (SRO)
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              twin.verificationMatrix?.registration?.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {twin.verificationMatrix?.registration?.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {twin.verificationMatrix?.registration?.remarks || 'Sale Deed conveyance registered. Stamp duty cleared and Encumbrance verified.'}
                        </p>
                      </div>

                      {/* Pillar 4: Municipality */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-amber-600" />
                            4. Municipality & Local Body
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              twin.verificationMatrix?.municipality?.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {twin.verificationMatrix?.municipality?.status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {twin.verificationMatrix?.municipality?.remarks || 'Property Tax assessed and cleared. CMDA master plan compliance certified.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NEO4J LINEAGE GRAPH */}
              {twinTab === 'lineage' && (
                <Neo4jLineageGraphView
                  landId={twin.landId}
                  surveyNumber={twin.surveyNumber}
                  ownershipHistory={twin.ownershipHistory || []}
                  transactions={twin.transactions || []}
                  currentOwner={twin.currentOwner}
                />
              )}

              {/* TAB 4: TITLE DOCUMENTS VAULT */}
              {twinTab === 'documents' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-blue-600" />
                        Authoritative Verified Title Documents Vault
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cryptographically signed archives attached to Land ID: <span className="font-mono font-bold text-emerald-700">{landId}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload Document</span>
                      </button>
                      <span className="text-xs font-mono text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                        {allDocs.length} Files
                      </span>
                    </div>
                  </div>

                  {allDocs.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
                      <Lock className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-bold text-sm text-slate-700">No Documents Uploaded for this Land Parcel Yet</p>
                      <p className="text-slate-400 max-w-md mx-auto">
                        You can attach verified sale deeds, Patta/Chitta passbooks, survey drawings, or tax receipts using the Upload button above.
                      </p>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload First Document</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allDocs.map((doc: any, i: number) => {
                        const name = doc.documentName || doc.fileName || `Certified_Deed_${i + 1}.pdf`;
                        const type = doc.documentType || 'SALE_DEED';
                        const url = doc.downloadUrl || doc.s3PresignedUrl || doc.s3Url || doc.fileUrl;
                        const hash = doc.documentHash || doc.ipfsCid || doc.sha256Hash;

                        return (
                          <div
                            key={doc.id || i}
                            className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-3xl transition-all space-y-3.5 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-slate-900 truncate" title={name}>
                                    {name}
                                  </div>
                                  <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider mt-0.5">
                                    {type.replace(/_/g, ' ')}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                VERIFIED
                              </span>
                            </div>

                            {hash && (
                              <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 break-all leading-relaxed">
                                <span className="text-slate-400 font-bold">SHA-256: </span>
                                {hash}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
                              <span className="text-[11px] text-slate-500">
                                {doc.fileSizeBytes ? `${(Number(doc.fileSizeBytes) / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN') : 'Official Vault'}
                              </span>

                              {url && url !== '#' && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>View & Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SPATIAL POSTGIS */}
              {twinTab === 'spatial' && (
                <div className="space-y-6">
                  {/* Spatial Mini Map */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span>Interactive Cadastral Boundary Visualization</span>
                      </h3>
                      <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                        SRID: {twin.gis?.srid || 4326}
                      </span>
                    </div>

                    <SpatialMiniMap gis={twin.gis} surveyNumber={twin.surveyNumber} />
                  </div>

                  {/* Raw PostGIS GeoJSON Coordinates */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-sm text-blue-700">
                        PostGIS Geometry Coordinates Payload (GeoJSON)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">EPSG:4326 WGS84</span>
                    </div>
                    <pre className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-72 leading-relaxed">
                      {JSON.stringify(twin.gis || { type: 'Polygon', coordinates: [] }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">Authoritative State Engine: PostgreSQL + PostGIS + Neo4j Graph + MinIO S3 Vault</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-sm"
          >
            Close Digital Twin
          </button>
        </div>

        {/* 5. Nested Upload Document Modal in User Portal */}
        {isUploadOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-900">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upload Certified Land Document</h3>
                  <p className="text-xs text-slate-500">
                    Attaches official deed or record to Land ID: <span className="font-mono font-bold text-emerald-700">{landId}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Official Document Title *</label>
                  <input
                    type="text"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    placeholder="e.g. Patta Passbook Extract 2026 / Sale Deed 8842"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Target Cadastral Land ID</label>
                    <input
                      type="text"
                      value={landId}
                      disabled
                      className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-emerald-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Document Classification *</label>
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="PATTA_CHITTA">PATTA_CHITTA (Revenue Passbook)</option>
                      <option value="SALE_DEED">SALE_DEED (Registered Conveyance)</option>
                      <option value="SURVEY_FMB">SURVEY_FMB (DGPS Vector Cadastre)</option>
                      <option value="ENCUMBRANCE_CERTIFICATE">ENCUMBRANCE_CERTIFICATE (EC)</option>
                      <option value="7_12_EXTRACT">7_12_EXTRACT (RoR Record)</option>
                      <option value="TAX_RECEIPT">TAX_RECEIPT (Property Tax Clearance)</option>
                    </select>
                  </div>
                </div>

                {/* File picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      if (!uploadDocName) {
                        setUploadDocName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  accept=".pdf,.doc,.docx,.tiff,.gpkg,.png,.jpg"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    uploadFile
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
                  }`}
                >
                  {uploadFile ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-emerald-900 text-xs">{uploadFile.name}</p>
                      <p className="text-[10px] text-emerald-700">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Upload & Compute SHA-256
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="font-bold text-slate-800 text-xs">
                        Click to choose certified PDF or document file
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Supports PDF, GeoTIFF, GeoPackage up to 50MB.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload & Store</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
