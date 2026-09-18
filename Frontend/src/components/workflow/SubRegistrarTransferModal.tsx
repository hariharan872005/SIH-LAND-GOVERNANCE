import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FileCheck, 
  Network, 
  ArrowRight, 
  User, 
  Building2, 
  Hash, 
  Calendar, 
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useSubmitRegistrationAndTransfer } from '../../hooks/useQueries';
import { useToast } from '../../hooks/useToast';
import { DigitalTwinDetail } from '../../types';

export interface SubRegistrarTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: DigitalTwinDetail | null;
}

interface TransferFormValues {
  deedNumber: string;
  registrationDate: string;
  transferType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'PARTITION' | 'GOVT_ALLOTMENT';
  newOwnerName: string;
  newOwnerIdHash: string;
  newOwnershipType: DigitalTwinDetail['ownershipType'];
  considerationAmountINR: number;
  sroOffice: string;
  remarks: string;
}

export const SubRegistrarTransferModal: React.FC<SubRegistrarTransferModalProps> = ({
  isOpen,
  onClose,
  parcel,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const transferMutation = useSubmitRegistrationAndTransfer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    defaultValues: {
      deedNumber: `DOC/TN/AMB/${Math.floor(1000 + Math.random() * 9000)}/2026`,
      registrationDate: new Date().toISOString().split('T')[0],
      transferType: 'SALE',
      newOwnerName: 'Lakshmi Narayanan Real Estate Pvt Ltd',
      newOwnerIdHash: 'CIN:U70100TN2026PTC8849',
      newOwnershipType: 'CORPORATE',
      considerationAmountINR: parcel?.marketValueINR || 95000000,
      sroOffice: 'Sub-Registrar Office Ambattur (Zone 7, Chennai)',
      remarks: 'Title verification complete. Consideration paid via RTGS. Stamp duty and registration fee accounted.',
    },
  });

  if (!parcel) return null;

  const isSurveyVerified = parcel.verificationMatrix?.survey?.status === 'VERIFIED';

  const onSubmit = async (values: TransferFormValues) => {
    if (!isSurveyVerified) {
      toastError(
        'Survey Verification Required',
        `Land parcel ${parcel.landId} must be verified by the Survey Department before deed registration can proceed.`
      );
      return;
    }
    try {
      await transferMutation.mutateAsync({
        subRegistrar: currentUser,
        data: {
          landId: parcel.landId,
          previousOwnerId: parcel.currentOwnerIdHash || parcel.currentOwnerName || 'P001',
          previousOwnerName: parcel.currentOwnerName,
          ...values,
          considerationAmountINR: Number(values.considerationAmountINR),
        },
      });

      success(
        'Deed Registered & Ownership Transferred',
        `Transferred from ${parcel.currentOwnerName} to ${values.newOwnerName}. Neo4j ownership graph updated. Event LAND_TRANSFER_COMPLETED emitted.`
      );
      reset();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit registration';
      toastError('Registration Failed', errorMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deed Registration & Ownership Transfer: ${parcel.landId}`}
      subtitle="Sub-Registrar Office (SRO) Title Conveyance & Neo4j Chain Preserver."
      size="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
        {/* Survey Verification Lock Warning */}
        {!isSurveyVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wide text-amber-900">Survey Verification Required (Pre-Requisite)</p>
              <p className="text-[11px] text-amber-800 mt-1">
                Land parcel <strong>{parcel.landId}</strong> has not completed Cadastral Survey verification. The Sub-Registrar cannot execute ownership transfers or register conveyance deeds until the Survey Department completes DGPS field demarcation.
              </p>
            </div>
          </div>
        )}

        {/* Chain of Custody Transfer Progress Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Network className="w-4 h-4 text-black" />
              Neo4j Chain-of-Custody Lineage Transition
            </span>
            <span className="px-2 py-0.5 rounded bg-black text-white font-bold font-mono text-[10px]">
              NO OVERWRITING • IMMUTABLE HISTORICAL CHAIN
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
            <div className="flex-1 text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Transferor (Current Title Holder)</span>
              <p className="font-bold text-slate-900 text-sm truncate">{parcel.currentOwnerName}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                ID: {parcel.currentOwnerIdHash} ({parcel.ownershipType})
              </p>
            </div>

            <div className="p-2 rounded-full bg-slate-100 border border-slate-300 text-slate-800 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="flex-1 text-left sm:text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Transferee (New Registered Title Holder)</span>
              <p className="font-bold text-black text-sm">To be confirmed below</p>
              <p className="text-[10px] text-emerald-700 font-mono font-bold">New (:Person)-[:OWNS]-&gt;(:Land) node</p>
            </div>
          </div>
        </div>

        {/* Section 1: Registered Deed Info */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
            <FileCheck className="w-4 h-4 text-black" />
            1. Registration Office & Deed Metadata
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Deed Registration Number *
              </label>
              <input
                type="text"
                {...register('deedNumber', { required: 'Deed number is required' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.deedNumber && <p className="text-[10px] text-rose-600 mt-1">{errors.deedNumber.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Registration Date *
              </label>
              <input
                type="date"
                {...register('registrationDate', { required: 'Date is required' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Transfer Conveyance Type *
              </label>
              <select
                {...register('transferType')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="SALE">SALE (Absolute Sale Deed)</option>
                <option value="INHERITANCE">INHERITANCE (Legal Succession)</option>
                <option value="GIFT">GIFT (Settlement Deed)</option>
                <option value="PARTITION">PARTITION (Family Settlement)</option>
                <option value="GOVT_ALLOTMENT">GOVERNMENT ALLOTMENT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Transferee (New Owner) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
            <User className="w-4 h-4 text-black" />
            2. Transferee (New Legal Owner)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                New Legal Owner Name *
              </label>
              <input
                type="text"
                {...register('newOwnerName', { required: 'New owner name is required' })}
                placeholder="e.g. Lakshmi Narayanan Real Estate"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.newOwnerName && <p className="text-[10px] text-rose-600 mt-1">{errors.newOwnerName.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                New Owner PAN / CIN / Aadhaar Ref *
              </label>
              <input
                type="text"
                {...register('newOwnerIdHash', { required: 'Identifier reference is required' })}
                placeholder="e.g. PAN:AACCL8839M"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.newOwnerIdHash && <p className="text-[10px] text-rose-600 mt-1">{errors.newOwnerIdHash.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ownership Category *
              </label>
              <select
                {...register('newOwnershipType')}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Total Transaction Consideration (INR) *
              </label>
              <input
                type="number"
                {...register('considerationAmountINR', { required: 'Consideration is required' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sub-Registrar Office Jurisdiction *
              </label>
              <input
                type="text"
                {...register('sroOffice')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Remarks */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            3. Registration Ledger Remarks & Verification Notes
          </label>
          <textarea
            rows={2}
            {...register('remarks')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Pipeline State Machine Advance Notice */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>Next Pipeline Transition:</span>
          <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-slate-300">
            REQUIRES_MUNICIPAL_VERIFICATION
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
            disabled={isSubmitting || transferMutation.isPending || !isSurveyVerified}
            className={`px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 ${
              isSurveyVerified
                ? 'bg-black hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isSurveyVerified ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>
              {transferMutation.isPending
                ? 'Completing Registration...'
                : !isSurveyVerified
                ? 'Locked (Survey Required)'
                : 'Complete Registration'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
