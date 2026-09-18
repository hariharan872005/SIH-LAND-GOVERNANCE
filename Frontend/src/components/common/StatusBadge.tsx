import React from 'react';
import { 
  VerificationPillarStatus, 
  OverallVerificationStatus, 
  OfficerStatus, 
  LandType,
  GeoHierarchyScope 
} from '../../types';
import { CheckCircle2, Clock, XCircle, AlertOctagon, MapPin } from 'lucide-react';

interface StatusBadgeProps {
  status: VerificationPillarStatus | OverallVerificationStatus | OfficerStatus | LandType | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showIcon = true }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  switch (status) {
    case 'VERIFIED':
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          {status}
        </span>
      );

    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          {status}
        </span>
      );

    case 'REJECTED':
    case 'INACTIVE':
    case 'SUSPENDED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          {status}
        </span>
      );

    case 'DISPUTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses}`}>
          {showIcon && <AlertOctagon className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
          {status}
        </span>
      );

    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 ${sizeClasses}`}>
          N/A
        </span>
      );

    case 'COMMERCIAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          COMMERCIAL
        </span>
      );

    case 'AGRICULTURAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-lime-50 text-lime-800 border border-lime-200 ${sizeClasses}`}>
          AGRICULTURAL
        </span>
      );

    case 'RESIDENTIAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 ${sizeClasses}`}>
          RESIDENTIAL
        </span>
      );

    case 'INDUSTRIAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          INDUSTRIAL
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const PillarPill: React.FC<{
  pillar: string;
  status: VerificationPillarStatus;
  onClick?: () => void;
}> = ({ pillar, status, onClick }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${getBadgeStyle()} ${
        onClick ? 'hover:shadow-xs cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className="text-slate-500 text-[10px] uppercase font-semibold">{pillar}:</span>
      <span className="font-bold">{status}</span>
    </button>
  );
};

export const ScopeBadge: React.FC<{ scope: GeoHierarchyScope; compact?: boolean }> = ({ scope, compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          {scope.district}, {scope.state}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="px-2 py-0.5 rounded bg-black text-white border border-black font-semibold text-[11px]">
        {scope.country}
      </span>
      <span className="text-slate-400">›</span>
      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-medium">
        {scope.state}
      </span>
      <span className="text-slate-400">›</span>
      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-medium">
        {scope.district}
      </span>
      {scope.taluk && (
        <>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-medium">
            {scope.taluk}
          </span>
        </>
      )}
      {scope.village && (
        <>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            {scope.village}
          </span>
        </>
      )}
    </div>
  );
};
