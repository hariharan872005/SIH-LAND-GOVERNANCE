import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LandParcel } from '../../types';
import { getPolygonBounds, getPolygonCenter } from '../../utils/geoUtils';
import { Plus, Minus, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface LandMapProps {
  parcels: LandParcel[];
  selectedLandId?: string;
  onSelectParcel: (parcel: LandParcel) => void;
  activeLayer?: 'satellite' | 'streets' | 'hybrid';
}

export const LandMap: React.FC<LandMapProps> = ({
  parcels,
  selectedLandId,
  onSelectParcel,
  activeLayer = 'streets',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelsLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.1142, 80.1542],
      zoom: 16,
      minZoom: 11,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    labelsLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base Tile Layer (Reliable standard OpenStreetMap & ESRI)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (activeLayer === 'satellite' || activeLayer === 'hybrid') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery';
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom: 20,
      attribution,
      className: activeLayer === 'streets' ? 'cadastre-tile-layer' : '',
    });

    tileLayer.addTo(map);
    baseTileLayerRef.current = tileLayer;
  }, [activeLayer]);

  // 3. Render Real Backend Parcels Layer & Floating Survey Number Tags
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (parcelsLayerRef.current) {
      map.removeLayer(parcelsLayerRef.current);
      parcelsLayerRef.current = null;
    }

    if (labelsLayerGroupRef.current) {
      labelsLayerGroupRef.current.clearLayers();
    }

    const validParcels = parcels.filter(
      (p) => p.gisCoordinatesJson && p.gisCoordinatesJson.coordinates
    );

    if (validParcels.length === 0) return;

    const featuresCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validParcels.map((p) => ({
        type: 'Feature',
        properties: {
          landId: p.landId,
          surveyNumber: p.surveyNumber,
          status: p.status,
          landType: p.landType,
          registeredArea: p.registeredArea,
          marketValueINR: p.marketValueINR,
          isDisputed: p.isDisputed,
          parcelObj: p,
        },
        geometry: {
          type: p.gisCoordinatesJson!.type as any,
          coordinates: p.gisCoordinatesJson!.coordinates as any,
        },
      })),
    };

    const parcelLayer = L.geoJSON(featuresCollection, {
      style: (feature) => {
        const p = feature?.properties.parcelObj as LandParcel;
        const isSelected =
          p.landId === selectedLandId ||
          p.surveyNumber === selectedLandId ||
          p.id === selectedLandId;
        const isConflict =
          p.isDisputed ||
          p.status === 'REQUIRES_CORRECTION' ||
          p.status === 'REJECTED';
        const isVerified = p.status === 'LAND_VERIFIED';

        if (isSelected) {
          return {
            fillColor: '#f59e0b',
            color: '#b45309',
            weight: 3.5,
            opacity: 1,
            fillOpacity: 0.85,
          };
        }

        if (isConflict) {
          return {
            fillColor: '#ef4444',
            color: '#991b1b',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.75,
          };
        }

        if (isVerified) {
          return {
            fillColor: '#10b981',
            color: '#047857',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7,
          };
        }

        // Requiring Verification / Default Cadastral Parcel
        return {
          fillColor: '#38bdf8',
          color: '#0284c7',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.65,
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties.parcelObj as LandParcel;
        const isSelected =
          p.landId === selectedLandId ||
          p.surveyNumber === selectedLandId ||
          p.id === selectedLandId;
        const isConflict = p.isDisputed || p.status === 'REQUIRES_CORRECTION';
        const isVerified = p.status === 'LAND_VERIFIED';

        // Survey Label Marker Tag
        const center = getPolygonCenter(p.gisCoordinatesJson);
        if (center && labelsLayerGroupRef.current) {
          const badgeClass = isSelected
            ? 'cadastre-label-badge-selected'
            : isConflict
            ? 'cadastre-label-badge-conflict'
            : isVerified
            ? 'cadastre-label-badge'
            : 'cadastre-label-badge text-blue-900 bg-blue-50 border-blue-400';

          const labelIcon = L.divIcon({
            className: 'cadastre-parcel-label',
            html: `<div class="${badgeClass}">#${p.surveyNumber}</div>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          });

          const marker = L.marker(center, { icon: labelIcon, interactive: false });
          labelsLayerGroupRef.current.addLayer(marker);
        }

        // Custom Tooltip
        const ownerName = p.owners?.[0]?.ownerName || 'Authoritative Title Record';
        const areaAcres = p.registeredArea ? `${p.registeredArea} Acres` : 'Demarcated Plot';

        const popupHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px 8px; min-width: 160px; text-align: left;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Authoritative Cadastre</div>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-top: 1px;">Survey #${p.surveyNumber}</div>
            <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">${p.landId} • ${areaAcres}</div>
            <div style="font-size: 11px; color: #334155; margin-top: 2px;">Owner: <b>${ownerName}</b></div>
            <div style="margin-top: 5px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; color: ${
              isConflict ? '#dc2626' : isVerified ? '#059669' : '#0284c7'
            }; text-transform: uppercase;">
              ${p.status.replace(/_/g, ' ')}
            </div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Click to inspect authoritative Digital Twin</div>
          </div>
        `;
        layer.bindTooltip(popupHtml, { direction: 'top', sticky: true, opacity: 0.95 });

        layer.on({
          mouseover: (e) => {
            const target = e.target;
            if (!isSelected) {
              target.setStyle({
                fillColor: '#38bdf8',
                color: '#0369a1',
                weight: 3,
                fillOpacity: 0.9,
              });
            }
          },
          mouseout: (e) => {
            const target = e.target;
            if (!isSelected) {
              target.setStyle({
                fillColor: isConflict ? '#ef4444' : isVerified ? '#10b981' : '#38bdf8',
                color: isConflict ? '#991b1b' : isVerified ? '#047857' : '#0284c7',
                weight: 2,
                fillOpacity: isConflict ? 0.75 : isVerified ? 0.7 : 0.65,
              });
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectParcel(p);
          },
        });
      },
    });

    parcelLayer.addTo(map);
    parcelsLayerRef.current = parcelLayer;

    // Fit map view to bounds of the parcels
    try {
      const layerBounds = parcelLayer.getBounds();
      if (layerBounds.isValid()) {
        map.fitBounds(layerBounds, { padding: [50, 50], maxZoom: 17 });
      }
    } catch {
      // ignore
    }
  }, [parcels, selectedLandId, onSelectParcel]);

  // Center/Fit Map on Selected Land Parcel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLandId) return;

    const selectedParcel = parcels.find(
      (p) =>
        p.landId === selectedLandId ||
        p.surveyNumber === selectedLandId ||
        p.id === selectedLandId
    );
    if (selectedParcel && selectedParcel.gisCoordinatesJson) {
      const bounds = getPolygonBounds(selectedParcel.gisCoordinatesJson);
      if (bounds) {
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 18, animate: true });
      }
    }
  }, [selectedLandId, parcels]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (parcelsLayerRef.current && parcels.length > 0) {
      const bounds = parcelsLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current?.fitBounds(bounds, { padding: [40, 40] });
        return;
      }
    }
    mapInstanceRef.current?.setView([13.1142, 80.1542], 16);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#edf3ee]' : 'bg-[#edf3ee]'
      }`}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Center Prompt Pill Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-[#13221b] text-slate-100 text-xs font-semibold px-5 py-2.5 rounded-full shadow-2xl border border-[#2d4a3b] flex items-center gap-2 pointer-events-auto backdrop-blur-md">
          <span>Click any parcel to inspect authoritative Digital Twin & history</span>
        </div>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-300/80 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-4 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[#10b981] border border-[#047857] rounded-sm inline-block shrink-0" />
            <span className="text-[11px] font-semibold text-slate-800">Verified Parcel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[#38bdf8] border border-[#0284c7] rounded-sm inline-block shrink-0" />
            <span className="text-[11px] font-semibold text-slate-800">In Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-[#ef4444] border border-[#991b1b] rounded-sm inline-block shrink-0" />
            <span className="text-[11px] font-semibold text-slate-800">Conflict / Correction</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Minimal Zoom Controls (+ / -) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden pointer-events-auto">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors border-b border-slate-200 flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Fullscreen & Reset Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleReset}
          title="Fit All Authoritative Parcels"
          className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-300 shadow-md transition-all text-xs font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-300 shadow-md transition-all text-xs font-semibold"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
