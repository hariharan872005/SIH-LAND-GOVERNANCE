import React from 'react';
import { Info } from 'lucide-react';
import { getStatusBadgeConfig } from '../../utils/geoUtils';

export const MapLegend: React.FC = () => {
  const statuses = [
    'LAND_VERIFIED',
    'REQUIRES_SURVEY',
    'REQUIRES_REGISTRATION_VERIFICATION',
    'REQUIRES_MUNICIPAL_VERIFICATION',
    'REQUIRES_CORRECTION',
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-xl space-y-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-300 uppercase tracking-wider text-[10px]">
        <Info className="w-3.5 h-3.5 text-cyan-400" />
        <span>Cadastral Status Legend</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((statusKey) => {
          const badge = getStatusBadgeConfig(statusKey);
          return (
            <div key={statusKey} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-md shrink-0 border"
                style={{
                  backgroundColor: badge.fillColor,
                  borderColor: badge.strokeColor,
                }}
              />
              <span className="text-[11px] text-slate-300 font-medium">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
