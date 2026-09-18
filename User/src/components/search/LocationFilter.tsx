import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import {
  useStatesQuery,
  useDistrictsQuery,
  useTaluksQuery,
  useVillagesQuery,
} from '../../hooks/useLandQueries';

interface LocationFilterProps {
  selectedState: string;
  selectedDistrict: string;
  selectedTaluk: string;
  selectedVillage: string;
  onStateChange: (stateId: string) => void;
  onDistrictChange: (districtId: string) => void;
  onTalukChange: (talukId: string) => void;
  onVillageChange: (villageId: string) => void;
  onReset: () => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedState,
  selectedDistrict,
  selectedTaluk,
  selectedVillage,
  onStateChange,
  onDistrictChange,
  onTalukChange,
  onVillageChange,
  onReset,
}) => {
  const { data: states = [] } = useStatesQuery();
  const { data: districts = [] } = useDistrictsQuery(selectedState !== 'ALL' ? selectedState : undefined);
  const { data: taluks = [] } = useTaluksQuery(selectedDistrict !== 'ALL' ? selectedDistrict : undefined);
  const { data: villages = [] } = useVillagesQuery(selectedTaluk !== 'ALL' ? selectedTaluk : undefined);

  const isFiltered =
    selectedState !== 'ALL' ||
    selectedDistrict !== 'ALL' ||
    selectedTaluk !== 'ALL' ||
    selectedVillage !== 'ALL';

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-3.5 shadow-xl space-y-2.5 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Cadastral Hierarchy Filter</span>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* State Select */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              onStateChange(e.target.value);
              onDistrictChange('ALL');
              onTalukChange('ALL');
              onVillageChange('ALL');
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              onDistrictChange(e.target.value);
              onTalukChange('ALL');
              onVillageChange('ALL');
            }}
            disabled={selectedState === 'ALL' && districts.length === 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium px-2.5 py-2 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="ALL">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Taluk Select */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Taluk / Tehsil</label>
          <select
            value={selectedTaluk}
            onChange={(e) => {
              onTalukChange(e.target.value);
              onVillageChange('ALL');
            }}
            disabled={selectedDistrict === 'ALL' && taluks.length === 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium px-2.5 py-2 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="ALL">All Taluks</option>
            {taluks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Village Select */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Village</label>
          <select
            value={selectedVillage}
            onChange={(e) => onVillageChange(e.target.value)}
            disabled={selectedTaluk === 'ALL' && villages.length === 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium px-2.5 py-2 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="ALL">All Villages</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
