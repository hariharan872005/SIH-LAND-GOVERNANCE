import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FileText, 
  MapPin, 
  User, 
  Building2, 
  ShieldCheck, 
  Globe2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useCreateParcelByTahsildar } from '../../hooks/useQueries';
import { useToast } from '../../hooks/useToast';
import { LandType } from '../../types';

export interface CreateLandParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: (landId: string) => void;
}

interface TahsildarParcelFormValues {
  landId: string;
  surveyNumber: string;
  subDivisionNumber?: string;
  landType: LandType;
  areaInAcres: number;
  marketValueINR: number;
  ownerName: string;
  ownerIdHash: string;
  ownershipType: 'INDIVIDUAL' | 'JOINT' | 'CORPORATE' | 'TRUST' | 'GOVERNMENT';
  existingLandRecordRef?: string;
}

export const CreateLandParcelModal: React.FC<CreateLandParcelModalProps> = ({
  isOpen,
  onClose,
  onSuccessCreated,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const createMutation = useCreateParcelByTahsildar();

  const [generatedLandId] = useState(() => `TN-CHE-${Math.floor(100 + Math.random() * 900)}`);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TahsildarParcelFormValues>({
    defaultValues: {
      landId: generatedLandId,
      surveyNumber: `${Math.floor(100 + Math.random() * 800)}/1A`,
      subDivisionNumber: '1',
      landType: 'COMMERCIAL',
      areaInAcres: 2.5,
      marketValueINR: 85000000,
      ownerName: 'V. Sundaram & Sons Enterprises',
      ownerIdHash: 'PAN:AAACS9841K',
      ownershipType: 'CORPORATE',
      existingLandRecordRef: 'TN-REV-PATTA-8842/2026',
    },
  });

  const onSubmit = async (values: TahsildarParcelFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        tahsildar: currentUser,
        data: {
          ...values,
          areaInAcres: Number(values.areaInAcres),
          marketValueINR: Number(values.marketValueINR),
        },
      });

      success(
        'Land Parcel Initiated',
        `Parcel ${created.landId} created in Ambattur Taluk. Workflow status set to REQUIRES_SURVEY.`
      );
      reset();
      onClose();
      if (onSuccessCreated) onSuccessCreated(created.landId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Could not initiate land parcel.';
      toastError('Creation Failed', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Primary Land Parcel Creation"
      subtitle="Initiates official Record of Rights (RoR) entry. Auto-inherits assigned Taluk jurisdiction."
      size="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Tahsildar Scope Lock Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
          <div className="p-1.5 rounded-lg bg-black text-white shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900">
                Authorized Executive Scope: {currentUser.scope.state} → {currentUser.scope.district} → {currentUser.scope.taluk}
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold font-mono">
                LOCKED TO JURISDICTION
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Initiating Officer: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.designation})
            </p>
          </div>
        </div>

        {/* Section 1: Identification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-black" />
            1. Cadastral Identification
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Land ID (System Key) *
              </label>
              <input
                type="text"
                {...register('landId', { required: 'Land ID is required' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.landId && <p className="text-[10px] text-rose-600 mt-1">{errors.landId.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Survey Number *
              </label>
              <input
                type="text"
                {...register('surveyNumber', { required: 'Survey number is required' })}
                placeholder="e.g. 442/1A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.surveyNumber && <p className="text-[10px] text-rose-600 mt-1">{errors.surveyNumber.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sub-Division Number
              </label>
              <input
                type="text"
                {...register('subDivisionNumber')}
                placeholder="e.g. 2B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Land Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-black" />
            2. Land Classification & Extent
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Land Zoning Type *
              </label>
              <select
                {...register('landType')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
              >
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="RESIDENTIAL">RESIDENTIAL</option>
                <option value="AGRICULTURAL">AGRICULTURAL</option>
                <option value="INDUSTRIAL">INDUSTRIAL</option>
                <option value="GOVERNMENT">GOVERNMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Initial Extent (Acres) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('areaInAcres', { required: 'Area is required', min: 0.01 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Estimated Market Value (INR) *
              </label>
              <input
                type="number"
                {...register('marketValueINR', { required: 'Value is required' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Owner Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-black" />
            3. Primary Title Holder & Identifiers
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Legal Owner Name *
              </label>
              <input
                type="text"
                {...register('ownerName', { required: 'Owner name is required' })}
                placeholder="e.g. Ramesh K. Verma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black font-semibold"
              />
              {errors.ownerName && <p className="text-[10px] text-rose-600 mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Govt Identifier Ref (PAN/Aadhaar/CIN) *
              </label>
              <input
                type="text"
                {...register('ownerIdHash', { required: 'ID reference is required' })}
                placeholder="e.g. PAN:AAACP4821M"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black uppercase"
              />
              {errors.ownerIdHash && <p className="text-[10px] text-rose-600 mt-1">{errors.ownerIdHash.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ownership Category *
              </label>
              <select
                {...register('ownershipType')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="JOINT">JOINT</option>
                <option value="CORPORATE">CORPORATE</option>
                <option value="TRUST">TRUST</option>
                <option value="GOVERNMENT">GOVERNMENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Existing Land Record / Patta Chitta Reference Docket
            </label>
            <input
              type="text"
              {...register('existingLandRecordRef')}
              placeholder="e.g. TN-REV-PATTA-4412/2026 / Gazette No 118"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* State Machine Transition Footnote */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>Initial Verification State:</span>
          <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-slate-300">
            REQUIRES_SURVEY
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="px-5 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending ? 'Initiating...' : 'Create Parcel Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
