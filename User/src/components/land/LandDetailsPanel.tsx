import React from 'react';
import { LandParcel } from '../../types';
import { useDigitalTwinQuery, useOwnershipHistoryQuery, useDocumentsQuery } from '../../hooks/useLandQueries';
import {
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  User,
  FileText,
  AlertCircle,
  Compass,
  CheckCircle2,
  Clock,
  Landmark,
} from 'lucide-react';

interface LandDetailsPanelProps {
  parcel: LandParcel | null;
  onClose: () => void;
  onOpenDigitalTwin?: (landId: string) => void;
}

export const LandDetailsPanel: React.FC<LandDetailsPanelProps> = ({
  parcel,
  onClose,
  onOpenDigitalTwin,
}) => {
  const landId = parcel?.landId;
  const { data: twin, isLoading: twinLoading } = useDigitalTwinQuery(landId);
  const { data: ownershipHistory = [] } = useOwnershipHistoryQuery(landId);
  const { data: documents = [] } = useDocumentsQuery(landId);

  if (!parcel) return null;

  const isConflict = parcel.isDisputed || parcel.status === 'REQUIRES_CORRECTION';
  const isVerified = parcel.status === 'LAND_VERIFIED';

  // Pillar verification statuses
  const revStatus = twin?.verificationMatrix?.revenue?.status || 'VERIFIED';
  const surStatus =
    twin?.verificationMatrix?.survey?.status ||
    (parcel.status === 'REQUIRES_SURVEY' ? 'PENDING' : parcel.status === 'LAND_VERIFIED' ? 'VERIFIED' : 'PENDING');
  const regStatus =
    twin?.verificationMatrix?.registration?.status ||
    (parcel.status === 'REQUIRES_REGISTRATION_VERIFICATION' ? 'PENDING' : parcel.status === 'LAND_VERIFIED' ? 'VERIFIED' : 'PENDING');
  const munStatus =
    twin?.verificationMatrix?.municipality?.status ||
    (parcel.status === 'REQUIRES_MUNICIPAL_VERIFICATION' ? 'PENDING' : parcel.status === 'LAND_VERIFIED' ? 'VERIFIED' : 'PENDING');

  const isSurveyDone = surStatus === 'VERIFIED';

  // Extract real backend fields
  const registeredAreaAcres =
    Number(parcel.measuredArea) ||
    Number(parcel.registeredArea) ||
    Number(twin?.landDetails?.measuredArea) ||
    Number(twin?.landDetails?.registeredArea) ||
    Number(twin?.gis?.areaInAcres) ||
    0;
  const areaSqm = Math.round(registeredAreaAcres * 4046.86);
  const perimeterM = Math.round(4 * Math.sqrt(areaSqm));
  const sideApproxM = Math.round(Math.sqrt(areaSqm));

  interface OwnerDisplay {
    id?: string;
    landId?: string;
    ownerName: string;
    ownerIdHash?: string;
    maskedAadhaarOrId?: string;
    ownershipType?: string;
    ownershipPercentage: string;
    isCurrentOwner?: boolean;
    acquiredDate?: string;
    deedRegistrationNumber?: string;
    considerationAmountINR?: string;
  }

  const ownersList: OwnerDisplay[] = (parcel.owners && parcel.owners.length > 0)
    ? parcel.owners.map((o) => ({
        id: o.id,
        landId: o.landId,
        ownerName: o.ownerName,
        ownerIdHash: o.ownerIdHash,
        maskedAadhaarOrId: o.maskedAadhaarOrId,
        ownershipType: o.ownershipType,
        ownershipPercentage: String(o.ownershipPercentage || 100),
        isCurrentOwner: Boolean(o.isCurrentOwner),
        acquiredDate: o.acquiredDate,
        deedRegistrationNumber: o.deedRegistrationNumber,
        considerationAmountINR: o.considerationAmountINR,
      }))
    : twin?.ownershipHistory && twin.ownershipHistory.length > 0
    ? twin.ownershipHistory.map((h: any, i: number) => ({
        id: h.id || `own-${i}`,
        landId: parcel.landId,
        ownerName: h.name || h.ownerName || 'State Record Holder',
        ownerIdHash: h.panOrAadhaarHash || h.ownerIdHash || 'GOV_REGISTRY_RECORD',
        ownershipType: h.ownershipType || 'INDIVIDUAL',
        ownershipPercentage: String(h.ownershipPercentage || 100),
        isCurrentOwner: Boolean(h.isCurrentOwner),
        acquiredDate: h.acquiredDate,
        deedRegistrationNumber: h.deedRegistrationNumber,
        considerationAmountINR: String(h.considerationAmountINR || parcel.marketValueINR),
      }))
    : twin?.currentOwner
    ? [
        {
          id: 'own-curr',
          landId: parcel.landId,
          ownerName: twin.currentOwner.ownerName,
          ownerIdHash: twin.currentOwner.ownerIdHash,
          maskedAadhaarOrId: twin.currentOwner.maskedAadhaarOrId,
          ownershipType: twin.currentOwner.ownershipType || 'INDIVIDUAL',
          ownershipPercentage: String(twin.currentOwner.ownershipPercentage || 100),
          isCurrentOwner: true,
          acquiredDate: twin.currentOwner.acquiredDate,
          deedRegistrationNumber: twin.currentOwner.deedRegistrationNumber,
          considerationAmountINR: String(twin.landDetails?.marketValueINR || parcel.marketValueINR),
        },
      ]
    : [];

  const currentOwner = ownersList.find((o) => o.isCurrentOwner) || ownersList[0] || {
    ownerName: 'Government of Tamil Nadu',
    ownerIdHash: 'TN-REV-DEPT',
    ownershipType: 'STATE_GOVERNMENT',
  };

  const villageName = parcel.village?.name || twin?.location?.villageName || 'Ambattur OT';
  const talukName = parcel.taluk?.name || twin?.location?.talukName || 'Ambattur';
  const districtName = parcel.district?.name || twin?.location?.districtName || 'Chennai';

  return (
    <div className="w-full h-full bg-white flex flex-col shadow-2xl border-l border-slate-200 overflow-hidden font-sans">
      {/* 1. Header (Dark Forest Green) */}
      <div className="bg-[#13221b] text-white p-5 flex items-start justify-between relative shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#72c29b]">
              Cadastral Unit
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1e382b] text-[#9de8c1] border border-[#2d523f]">
              Survey #{parcel.surveyNumber}
            </span>
          </div>
          <h2 className="text-xl font-extrabold mt-1 tracking-tight text-slate-100 flex items-center gap-2">
            <span>Survey No: {parcel.surveyNumber}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {villageName}, {talukName}, {districtName}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Small badge top right */}
        <div className="absolute bottom-3 right-5 text-[10px] font-mono text-emerald-400/80 bg-black/40 px-2 py-0.5 rounded">
          {parcel.landId}
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs bg-[#fafbfc]">
        {/* 6-Grid Key Metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              AREA
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {areaSqm > 0 ? `${areaSqm.toLocaleString()} M²` : `${registeredAreaAcres} Acres`}
              <span className="text-[10px] font-normal text-slate-500 ml-1">
                ({Number(registeredAreaAcres).toFixed(4)} Ac)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              PERIMETER
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {perimeterM > 0 ? `~${perimeterM} M` : 'Cadastral Boundary'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              BOUNDING SPAN
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {sideApproxM > 0 ? `${sideApproxM} × ${sideApproxM} M` : 'Geodesic Extent'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              GEOMETRY
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              {isSurveyDone ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  DGPS Demarcated
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Awaiting Survey
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              JURISDICTION
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={`${villageName}, ${talukName}`}>
              {villageName}, {talukName}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              LIFECYCLE
            </div>
            <div className={`text-sm font-bold mt-0.5 ${
              isConflict
                ? 'text-rose-600'
                : isVerified
                ? 'text-emerald-700'
                : parcel.status === 'REQUIRES_SURVEY'
                ? 'text-amber-700'
                : 'text-blue-700'
            }`}>
              {isConflict
                ? 'Disputed / In Correction'
                : isVerified
                ? '4-Tier Verified'
                : parcel.status === 'REQUIRES_SURVEY'
                ? 'Requires Survey'
                : parcel.status === 'REQUIRES_REGISTRATION_VERIFICATION'
                ? 'Requires Registration'
                : 'Requires Municipality'}
            </div>
          </div>
        </div>

        {/* Section: 4-Pillar Cadastral Verification Progress */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>4-Pillar Governance Verification Process</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {parcel.landId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Revenue */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">1. Revenue (RoR)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  revStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {revStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Tahsildar Sanctioned</p>
            </div>

            {/* 2. Survey */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">2. Survey (GIS)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  surStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {surStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {surStatus === 'VERIFIED' ? 'DGPS Boundary Benchmarked' : 'Awaiting Field Survey'}
              </p>
            </div>

            {/* 3. Registration */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">3. Registration</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  regStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {regStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {regStatus === 'VERIFIED' ? 'Deed Validated by SRO' : 'Awaiting Survey Clearance'}
              </p>
            </div>

            {/* 4. Municipality */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">4. Municipality</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  munStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {munStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {munStatus === 'VERIFIED' ? 'PID & Tax Cleared' : 'Awaiting Assessment'}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Rights & Holders */}
        <div className="space-y-2.5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Rights & Authoritative Holders</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {ownersList.length > 0 ? ownersList.length : 1}
            </span>
          </div>

          {ownersList.map((r: OwnerDisplay, i: number) => (
            <div key={r.id || i} className="flex items-start justify-between bg-white p-3 rounded-lg border border-slate-200/80 shadow-sm">
              <div>
                <div className="font-bold text-slate-900 text-xs">{r.ownerName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ownership · share {r.ownershipPercentage}% ({r.ownershipType || 'INDIVIDUAL'})
                </div>
                {r.ownerIdHash && (
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{r.ownerIdHash}</div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium text-right max-w-[140px]">
                {r.deedRegistrationNumber || `${districtName} SRO Record`}
              </span>
            </div>
          ))}
        </div>

        {/* Section: Authoritative Backend Assertions */}
        <div className="space-y-2.5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Authoritative PostGIS / Spatial Assertions</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              2
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">{currentOwner.ownerName}</span>
              <span className="text-[10px] font-mono uppercase text-emerald-700 font-semibold">POSTGIS_RECORD</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Active title holder registered at {villageName} Revenue Taluk ({talukName})
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Spatial Footprint Coordinates</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">EPSG:4326</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-700 break-all leading-relaxed">
              {JSON.stringify({
                landId: parcel.landId,
                surveyNumber: parcel.surveyNumber,
                type: parcel.gisCoordinatesJson?.type || 'Polygon',
                postGisTable: twin?.landDetails?.postGisTable || 'public.spatial_parcels_india',
                geoServerLayer: parcel.geoServerLayerName || `national_cadastre:${parcel.landId.toLowerCase().replace(/-/g, '_')}`,
              })}
            </div>
          </div>
        </div>

        {/* Section: Transaction & Lineage History */}
        <div className="space-y-2.5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">Transaction & Valuation</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              1
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                Valuation Assessment · {parcel.landType}
              </span>
              <span className="font-bold text-emerald-800 text-xs">
                ₹{Number(parcel.marketValueINR || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Classification: {parcel.classification || `${parcel.landType} Urban Plot`}
            </div>
            {currentOwner.acquiredDate && (
              <div className="text-[10px] text-slate-400">
                Acquisition Date: {new Date(currentOwner.acquiredDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-medium pt-1 italic">
            History projection: PostgreSQL/PostGIS & Neo4j authoritative registry.
          </div>
        </div>
      </div>

      {/* 3. Footer: Launch 3D Digital Twin Button */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <button
          onClick={() => onOpenDigitalTwin && onOpenDigitalTwin(parcel.landId)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Launch 3D Digital Twin for #{parcel.surveyNumber} ({parcel.landId})</span>
          <ChevronRight className="w-4 h-4 text-emerald-200 ml-auto" />
        </button>
      </div>
    </div>
  );
};
