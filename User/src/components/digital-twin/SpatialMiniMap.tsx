import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GISCoordinates } from '../../types';
import { getPolygonBounds } from '../../utils/geoUtils';

interface SpatialMiniMapProps {
  gis?: GISCoordinates;
  surveyNumber: string;
}

export const SpatialMiniMap: React.FC<SpatialMiniMapProps> = ({ gis, surveyNumber }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !gis || !gis.coordinates) return;

    // Clear previous vector layers
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    const geojson: GeoJSON.Feature = {
      type: 'Feature',
      properties: { surveyNumber },
      geometry: {
        type: gis.type as any,
        coordinates: gis.coordinates as any,
      },
    };

    const layer = L.geoJSON(geojson, {
      style: {
        color: '#10b981',
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.45,
      },
    }).addTo(map);

    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [gis, surveyNumber]);

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-emerald-400">
        Survey #{surveyNumber} Footprint
      </div>
    </div>
  );
};
