import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandMap } from '../components/map/LandMap';
import { GlobalSearchBar } from '../components/search/GlobalSearchBar';
import { LocationFilter } from '../components/search/LocationFilter';
import { LandDetailsPanel } from '../components/land/LandDetailsPanel';
import { DigitalTwinModal } from '../components/digital-twin/DigitalTwinModal';
import { useParcelsQuery } from '../hooks/useLandQueries';
import { LandParcel } from '../types';
import { SlidersHorizontal } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const landIdParam = searchParams.get('landId');

  // Filters State
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedTaluk, setSelectedTaluk] = useState('ALL');
  const [selectedVillage, setSelectedVillage] = useState('ALL');

  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [digitalTwinLandId, setDigitalTwinLandId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Parcels
  const { data: parcels = [] } = useParcelsQuery({
    stateId: selectedState,
    districtId: selectedDistrict,
    talukId: selectedTaluk,
    villageId: selectedVillage,
  });

  // Synchronize URL query param or select first authoritative parcel initially
  useEffect(() => {
    if (parcels.length > 0) {
      if (landIdParam) {
        const match = parcels.find(
          (p) => p.landId === landIdParam || p.surveyNumber === landIdParam || p.id === landIdParam
        );
        if (match) {
          setSelectedParcel(match);
          return;
        }
      }
      // Select first parcel from backend if none selected
      if (!selectedParcel && parcels[0]) {
        setSelectedParcel(parcels[0]);
      }
    }
  }, [landIdParam, parcels]);

  const handleSelectParcel = (parcel: LandParcel) => {
    setSelectedParcel(parcel);
    setSearchParams({ landId: parcel.surveyNumber || parcel.landId });
  };

  const handleClosePanel = () => {
    setSelectedParcel(null);
    setSearchParams({});
  };

  const handleResetFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedTaluk('ALL');
    setSelectedVillage('ALL');
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-[#edf3ee] flex flex-col font-sans">
      {/* Top Floating Search & Filter bar (Compact top-left) */}
      <div className="absolute top-4 left-6 z-20 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex-1">
            <GlobalSearchBar
              onSelectParcel={handleSelectParcel}
              selectedLandId={selectedParcel?.landId}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl backdrop-blur-md border shadow-md transition-all ${
              showFilters || selectedState !== 'ALL' || selectedDistrict !== 'ALL'
                ? 'bg-emerald-700 text-white font-bold border-emerald-600'
                : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
            }`}
            title="Filter Cadastral Hierarchy"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Location Filter Bar */}
        {showFilters && (
          <div className="pointer-events-auto animate-fadeIn bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-300 shadow-2xl">
            <LocationFilter
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedTaluk={selectedTaluk}
              selectedVillage={selectedVillage}
              onStateChange={setSelectedState}
              onDistrictChange={setSelectedDistrict}
              onTalukChange={setSelectedTaluk}
              onVillageChange={setSelectedVillage}
              onReset={handleResetFilters}
            />
          </div>
        )}
      </div>

      {/* Main Interactive Cadastral Map View */}
      <div className="flex-1 w-full h-full relative z-0">
        <LandMap
          parcels={parcels}
          selectedLandId={selectedParcel?.landId || selectedParcel?.surveyNumber}
          onSelectParcel={handleSelectParcel}
          activeLayer="streets"
        />
      </div>

      {/* Side Details Drawer (Desktop: Right Overlay, Mobile: Full Width) */}
      {selectedParcel && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] lg:w-[460px] z-30 pointer-events-auto animate-slideLeft shadow-2xl">
          <LandDetailsPanel
            parcel={selectedParcel}
            onClose={handleClosePanel}
            onOpenDigitalTwin={(id) => setDigitalTwinLandId(id)}
          />
        </div>
      )}

      {/* Full Digital Twin Vault Modal */}
      {digitalTwinLandId && (
        <DigitalTwinModal
          landId={digitalTwinLandId}
          onClose={() => setDigitalTwinLandId(null)}
        />
      )}
    </div>
  );
};
