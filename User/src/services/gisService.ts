import { LandParcel } from '../types';

export const gisService = {
  getGeoServerTileUrl(): string {
    return import.meta.env.VITE_GEOSERVER_TILE_URL || 'http://localhost:8080/geoserver/gwc/service/wmts';
  },

  extractParcelGeoJSON(parcels: LandParcel[]): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = parcels
      .filter((p) => p.gisCoordinatesJson && p.gisCoordinatesJson.coordinates)
      .map((parcel) => {
        return {
          type: 'Feature',
          properties: {
            landId: parcel.landId,
            surveyNumber: parcel.surveyNumber,
            status: parcel.status,
            landType: parcel.landType,
            areaInAcres: parcel.registeredArea,
            isDisputed: parcel.isDisputed,
          },
          geometry: {
            type: parcel.gisCoordinatesJson!.type as any,
            coordinates: parcel.gisCoordinatesJson!.coordinates as any,
          },
        };
      });

    return {
      type: 'FeatureCollection',
      features,
    };
  },
};
