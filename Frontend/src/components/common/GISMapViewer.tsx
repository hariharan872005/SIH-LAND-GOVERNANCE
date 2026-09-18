import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Database, 
  Server, 
  Compass, 
  Globe 
} from 'lucide-react';
import { GISCoordinates } from '../../types';

// Fix standard Leaflet default marker icon path issue in Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export interface GISMapViewerProps {
  gisBoundary: GISCoordinates;
  landId: string;
  surveyNumber: string;
  areaInAcres: number;
  geoServerLayerName?: string;
  postGisTable?: string;
  elevationMeters?: number;
  height?: string;
  showControls?: boolean;
}

export const GISMapViewer: React.FC<GISMapViewerProps> = ({
  gisBoundary,
  landId,
  surveyNumber,
  areaInAcres,
  geoServerLayerName = 'national_cadastre:parcel_layer',
  postGisTable = 'public.spatial_parcels_india',
  elevationMeters = 24.5,
  height = '440px',
  showControls = true
}) => {
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'light'>('street');
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false);

  const center: [number, number] = gisBoundary.center || [13.1152, 80.1564];

  const polygonPositions: [number, number][] = (gisBoundary.coordinates[0] as number[][]).map(
    (coord) => [coord[0], coord[1]] as [number, number]
  );

  const getTileLayer = () => {
    switch (mapLayer) {
      case 'satellite':
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        );
      case 'light':
        return (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        );
      case 'street':
      default:
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        );
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs group">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Parcel Info Chip */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 backdrop-blur-md text-xs text-slate-800 shadow-md font-medium">
          <Globe className="w-3.5 h-3.5 text-black" />
          <span className="font-bold text-black">{landId}</span>
          <span className="text-slate-300">|</span>
          <span>Survey #{surveyNumber}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-bold">{areaInAcres} Acres</span>
        </div>

        {/* Layer Switches */}
        {showControls && (
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 border border-slate-200 backdrop-blur-md p-1 rounded-xl shadow-md">
            <button
              type="button"
              onClick={() => setMapLayer('street')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapLayer === 'street'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              Standard Street
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapLayer === 'satellite'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapLayer === 'light'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              Minimal Light
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
              className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
              title="GeoServer / PostGIS Spatial Diagnostics"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <ChangeView center={center} zoom={16} />
          {getTileLayer()}

          {/* Cadastral Boundary Polygon */}
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#0f172a',
              fillColor: '#000000',
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '5, 5',
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 text-slate-800">
                <p className="font-bold text-black">Land Parcel ID: {landId}</p>
                <p>Survey No: {surveyNumber}</p>
                <p>Calculated Extent: {areaInAcres} Acres</p>
                <p className="text-[10px] text-slate-500 font-mono">EPSG:4326 WGS84</p>
              </div>
            </Popup>
          </Polygon>

          {/* Centroid Marker */}
          <Marker position={center}>
            <Popup>
              <div className="text-xs text-slate-800">
                <p className="font-bold text-black">Centroid Benchmark</p>
                <p className="font-mono text-[10px] text-slate-600">
                  Lat: {center[0].toFixed(5)}, Lng: {center[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Bottom Floating GeoServer/PostGIS Integration Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-[11px] font-mono text-slate-700 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-900 font-bold">PostGIS:</span>
            <span className="text-slate-600">{postGisTable}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <Server className="w-3 h-3 text-slate-600" />
            <span className="text-slate-900 font-bold">WFS/WMS:</span>
            <span className="text-slate-600">{geoServerLayerName}</span>
          </div>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-[11px] text-slate-700 shadow-md backdrop-blur-md">
          <Compass className="w-3 h-3 text-slate-700" />
          <span>Elevation: <strong className="text-black">{elevationMeters}m MSL</strong></span>
        </div>
      </div>

      {/* Spatial Diagnostic Details Box */}
      {showMetadataDrawer && (
        <div className="absolute top-14 right-3 z-[1001] w-80 p-4 bg-white border border-slate-200 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-black" />
              GeoServer & PostGIS Stack
            </span>
            <button
              onClick={() => setShowMetadataDrawer(false)}
              className="text-slate-400 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Spatial SRS:</span>
              <span className="text-slate-900 font-bold">EPSG:4326 (WGS84)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GeoServer Workspace:</span>
              <span className="text-slate-900 font-bold">national_cadastre</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PostGIS Geometry:</span>
              <span className="text-slate-900 font-bold">ST_Polygon(2D)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vertices Count:</span>
              <span className="text-slate-900 font-bold">{polygonPositions.length} Points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
