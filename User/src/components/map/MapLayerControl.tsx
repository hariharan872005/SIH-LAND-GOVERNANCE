import React from 'react';
import { Layers, Globe, Map as MapIcon } from 'lucide-react';

interface MapLayerControlProps {
  activeLayer: 'satellite' | 'streets' | 'hybrid';
  onLayerChange: (layer: 'satellite' | 'streets' | 'hybrid') => void;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  activeLayer,
  onLayerChange,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 text-xs font-sans">
      <button
        onClick={() => onLayerChange('streets')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
          activeLayer === 'streets'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <MapIcon className="w-3.5 h-3.5" />
        <span>OpenStreetMap</span>
      </button>

      <button
        onClick={() => onLayerChange('satellite')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
          activeLayer === 'satellite'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Satellite Imagery</span>
      </button>
    </div>
  );
};
