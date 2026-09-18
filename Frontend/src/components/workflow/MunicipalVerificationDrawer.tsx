import React, { useState } from 'react';
import { 
  Building2, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  MapPin, 
  CheckSquare 
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useSubmitMunicipalVerification, useFlagCorrectionOrReject } from '../../hooks/useQueries';
import { useToast } from '../../hooks/useToast';
import { DigitalTwinDetail } from '../../types';

export interface MunicipalVerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: DigitalTwinDetail | null;
}

export const MunicipalVerificationDrawer: React.FC<MunicipalVerificationDrawerProps> = ({
  isOpen,
  onClose,
  parcel,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const municipalMutation = useSubmitMunicipalVerification();
  const flagCorrectionMutation = useFlagCorrectionOrReject();

  const [propertyId, setPropertyId] = useState(
    parcel?.propertyId || `PROP-CHE-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [taxClearanceYear, setTaxClearanceYear] = useState<number>(2026);
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(14500);
  const [occupancyStatus, setOccupancyStatus] = useState('COMMERCIAL_OCCUPIED');
  const [remarks, setRemarks] = useState(
    'Property assessment verified against Municipal Master Plan 2026. Building plan approved by CMDA / Municipal Corporation. Property tax fully cleared through 2026.'
  );

  const [showCorrectionPrompt, setShowCorrectionPrompt] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');

  if (!parcel) return null;

  const handleApproveMunicipal = async () => {
    if (!propertyId.trim()) {
      toastError('Property ID Required', 'Please provide the municipal assessment property ID.');
      return;
    }

    try {
      const updated = await municipalMutation.mutateAsync({
        revenueOfficer: currentUser,
        data: {
          landId: parcel.landId,
          propertyId,
          taxClearanceYear: Number(taxClearanceYear),
          builtUpAreaSqFt: Number(builtUpAreaSqFt),
          occupancyStatus,
          remarks,
        },
      });

      if (updated.overallStatus === 'LAND_VERIFIED') {
        success(
          '4-Pillar Verification Complete!',
          `Parcel ${parcel.landId} is now officially LAND_VERIFIED across Revenue, Survey, Registration & Municipality.`
        );
      } else {
        success(
          'Municipal Clearance Recorded',
          `Municipal assessment verified for ${parcel.landId}.`
        );
      }
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification failed';
      toastError('Verification Failed', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  const handleRequestCorrection = async () => {
    if (!correctionReason.trim()) {
      toastError('Reason Required', 'Please specify the municipal violation or tax delinquency.');
      return;
    }

    try {
      await flagCorrectionMutation.mutateAsync({
        officer: currentUser,
        landId: parcel.landId,
        pillar: 'municipality',
        actionType: 'REQUIRES_CORRECTION',
        reason: correctionReason,
      });

      success('Correction Flagged', `Municipal violation flagged. Parcel returned for assessment compliance.`);
      setShowCorrectionPrompt(false);
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Action failed';
      toastError('Action Failed', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Municipal & Local-Body Verification: ${parcel.landId}`}
      subtitle={`Verifying Revenue Officer: ${currentUser.name} (${currentUser.designation})`}
      width="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => setShowCorrectionPrompt(!showCorrectionPrompt)}
            className="text-xs text-rose-700 hover:text-rose-900 font-bold"
          >
            {showCorrectionPrompt ? 'Cancel Correction' : 'Flag Municipal Violation →'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveMunicipal}
              disabled={municipalMutation.isPending}
              className="px-5 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{municipalMutation.isPending ? 'Verifying...' : 'Approve Municipal Clearance (LAND_VERIFIED)'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Parcel Meta Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-black" />
              Municipal Zone: Ward {parcel.village}, {parcel.taluk}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold font-mono text-[10px]">
              {parcel.landType} ZONING
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Registered Owner: <strong className="text-slate-800">{parcel.currentOwnerName}</strong> • Extent:{' '}
            <strong className="text-slate-800">{parcel.areaInAcres} Acres</strong>
          </p>
        </div>

        {/* Correction Box if toggled */}
        {showCorrectionPrompt && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
            <h4 className="font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Flag Municipal Violation / Unpaid Property Tax
            </h4>
            <textarea
              rows={3}
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="Specify the municipal issue (e.g. unapproved building construction, property tax arrears, master plan violation)..."
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestCorrection}
                disabled={flagCorrectionMutation.isPending}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Submit Municipal Objection
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Property Assessment */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-black" />
            1. Property Assessment & Tax Compliance
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Municipal Property Assessment ID *
              </label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Property Tax Clearance Upto (FY) *
              </label>
              <input
                type="number"
                value={taxClearanceYear}
                onChange={(e) => setTaxClearanceYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Building Information */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-black" />
            2. Building Permit & Built-Up Characteristics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Approved Built-Up Area (Sq. Ft.)
              </label>
              <input
                type="number"
                value={builtUpAreaSqFt}
                onChange={(e) => setBuiltUpAreaSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Occupancy / Structural Status
              </label>
              <select
                value={occupancyStatus}
                onChange={(e) => setOccupancyStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="COMMERCIAL_OCCUPIED">COMMERCIAL_OCCUPIED</option>
                <option value="RESIDENTIAL_OCCUPIED">RESIDENTIAL_OCCUPIED</option>
                <option value="VACANT_LAND">VACANT_LAND</option>
                <option value="UNDER_CONSTRUCTION">UNDER_CONSTRUCTION</option>
                <option value="INDUSTRIAL_OPERATIONAL">INDUSTRIAL_OPERATIONAL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Remarks */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            3. Municipal Assessment Verification Remarks
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* 4-Pillar Finalization Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Final 4-Pillar Milestone:</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Upon submitting this clearance, Revenue + Survey + Registration + Municipality will all be VERIFIED, marking the Digital Twin as <strong className="font-mono">LAND_VERIFIED</strong>.
          </p>
        </div>
      </div>
    </Drawer>
  );
};
