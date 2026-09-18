import { GISCoordinates, OverallVerificationStatus } from '../types';

export function getPolygonCenter(gisCoordinates?: GISCoordinates | null): [number, number] {
  if (!gisCoordinates || !gisCoordinates.coordinates || gisCoordinates.coordinates.length === 0) {
    return [13.115, 80.156]; // Default Chennai/Ambattur coordinates
  }

  try {
    let coords: number[][] = [];
    if (gisCoordinates.type === 'Polygon') {
      coords = (gisCoordinates.coordinates as number[][][])[0];
    } else if (gisCoordinates.type === 'MultiPolygon') {
      coords = (gisCoordinates.coordinates as number[][][][])[0][0];
    }

    if (!coords || coords.length === 0) return [13.115, 80.156];

    let sumLng = 0;
    let sumLat = 0;
    coords.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });

    return [sumLat / coords.length, sumLng / coords.length];
  } catch {
    return [13.115, 80.156];
  }
}

export function getPolygonBounds(gisCoordinates?: GISCoordinates | null): [[number, number], [number, number]] | null {
  if (!gisCoordinates || !gisCoordinates.coordinates || gisCoordinates.coordinates.length === 0) {
    return null;
  }

  try {
    let coords: number[][] = [];
    if (gisCoordinates.type === 'Polygon') {
      coords = (gisCoordinates.coordinates as number[][][])[0];
    } else if (gisCoordinates.type === 'MultiPolygon') {
      coords = (gisCoordinates.coordinates as number[][][][])[0][0];
    }

    if (!coords || coords.length === 0) return null;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coords.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    // Leaflet bounds format: [[southLat, westLng], [northLat, eastLng]]
    return [
      [minLat - 0.0005, minLng - 0.0005],
      [maxLat + 0.0005, maxLng + 0.0005],
    ];
  } catch {
    return null;
  }
}

export function getStatusBadgeConfig(status: OverallVerificationStatus | string) {
  switch (status) {
    case 'LAND_VERIFIED':
    case 'VERIFIED':
      return {
        label: 'Verified',
        bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotColor: 'bg-emerald-400',
        strokeColor: '#10b981',
        fillColor: '#059669',
      };
    case 'REQUIRES_SURVEY':
      return {
        label: 'Requires Survey',
        bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dotColor: 'bg-amber-400',
        strokeColor: '#f59e0b',
        fillColor: '#d97706',
      };
    case 'REQUIRES_REGISTRATION_VERIFICATION':
      return {
        label: 'Requires Registration',
        bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dotColor: 'bg-cyan-400',
        strokeColor: '#06b6d4',
        fillColor: '#0891b2',
      };
    case 'REQUIRES_MUNICIPAL_VERIFICATION':
      return {
        label: 'Requires Municipal',
        bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        dotColor: 'bg-purple-400',
        strokeColor: '#a855f7',
        fillColor: '#9333ea',
      };
    case 'REQUIRES_CORRECTION':
      return {
        label: 'Requires Correction',
        bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dotColor: 'bg-rose-400',
        strokeColor: '#f43f5e',
        fillColor: '#e11d48',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bgColor: 'bg-red-500/10 text-red-400 border-red-500/30',
        dotColor: 'bg-red-500',
        strokeColor: '#ef4444',
        fillColor: '#dc2626',
      };
    default:
      return {
        label: status || 'Pending',
        bgColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dotColor: 'bg-slate-400',
        strokeColor: '#64748b',
        fillColor: '#475569',
      };
  }
}
