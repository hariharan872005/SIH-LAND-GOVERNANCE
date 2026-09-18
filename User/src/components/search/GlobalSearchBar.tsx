import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchQuery } from '../../hooks/useLandQueries';
import { LandParcel } from '../../types';
import { getStatusBadgeConfig } from '../../utils/geoUtils';

interface GlobalSearchBarProps {
  onSelectParcel: (parcel: LandParcel) => void;
  selectedLandId?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onSelectParcel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchTerm, 350);
  const { data: results, isLoading } = useSearchQuery(debouncedQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (parcel: LandParcel) => {
    onSelectParcel(parcel);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-2xl font-sans" ref={dropdownRef}>
      <div className="relative flex items-center shadow-lg rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        <div className="pl-4 text-emerald-600">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by Land ID, Survey Number, District, Taluk or Village..."
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {isLoading && (
          <div className="pr-3 text-emerald-600 animate-spin">
            <Loader2 className="w-4 h-4" />
          </div>
        )}
        {searchTerm && !isLoading && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-complete Search Results Dropdown */}
      {isOpen && debouncedQuery.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              Searching authoritative Cadastral index...
            </div>
          )}

          {!isLoading && results && results.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">No matching land parcels found</p>
              <p className="text-slate-400">Try searching by Survey Number (e.g. 142/3B) or Land ID (e.g. TN-CHE-101)</p>
            </div>
          )}

          {!isLoading && results && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-emerald-700 tracking-wider uppercase flex items-center justify-between border-b border-slate-100">
                <span>Matching Cadastral Records ({results.length})</span>
                <span className="text-slate-400 font-normal">Click to Fly to Location</span>
              </div>
              {results.map((parcel) => {
                const badge = getStatusBadgeConfig(parcel.status);
                return (
                  <div
                    key={parcel.id}
                    onClick={() => handleSelect(parcel)}
                    className="p-3.5 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {parcel.landId}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                          Survey #{parcel.surveyNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bgColor}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {parcel.village?.name || 'Ambattur OT'}, {parcel.taluk?.name || 'Ambattur'}, {parcel.district?.name || 'Chennai'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {parcel.landType}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{parcel.measuredArea || parcel.registeredArea} Acres</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
