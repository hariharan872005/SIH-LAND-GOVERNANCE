import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { getStatusBadgeConfig } from '../../utils/geoUtils';

interface VerificationBadgesProps {
  verifications?: Array<{
    departmentName?: string;
    departmentCode?: string;
    status: string;
  }>;
  overallStatus: string;
}

export const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  verifications = [],
  overallStatus,
}) => {
  const pillars = [
    { name: 'Revenue / Land Records', key: 'REVENUE' },
    { name: 'Survey & Land Records', key: 'SURVEY' },
    { name: 'Registration & Stamps', key: 'REGISTRATION' },
    { name: 'Municipality / Local Body', key: 'MUNICIPALITY' },
  ];

  const getPillarStatus = (key: string) => {
    const found = verifications.find(
      (v) => v.departmentCode === key || (v.departmentName && v.departmentName.toUpperCase().includes(key))
    );
    return found ? found.status : 'PENDING';
  };

  const renderIcon = (status: string) => {
    if (status === 'VERIFIED') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'REQUIRES_CORRECTION') return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
  };

  const overallBadge = getStatusBadgeConfig(overallStatus);

  return (
    <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Governance Verification Matrix
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${overallBadge.bgColor}`}>
          Overall: {overallBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {pillars.map((p) => {
          const status = getPillarStatus(p.key);
          const isVerified = status === 'VERIFIED';
          return (
            <div
              key={p.key}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                isVerified
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {renderIcon(status)}
              <div className="min-w-0">
                <div className="text-[11px] font-medium truncate">{p.name}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                  {status === 'VERIFIED' ? 'Verified' : status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
