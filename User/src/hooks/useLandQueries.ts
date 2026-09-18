import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landService, LandFilterParams } from '../services/landService';
import { digitalTwinService } from '../services/digitalTwinService';
import { ownershipService } from '../services/ownershipService';
import { documentService } from '../services/documentService';
import { verificationService } from '../services/verificationService';
import { searchService } from '../services/searchService';
import { locationService } from '../services/locationService';

export function useParcelsQuery(params?: LandFilterParams) {
  return useQuery({
    queryKey: ['parcels', params],
    queryFn: () => landService.getAllParcels(params),
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useParcelDetailQuery(landId?: string) {
  return useQuery({
    queryKey: ['parcel-detail', landId],
    queryFn: () => (landId ? landService.getParcelById(landId) : null),
    enabled: !!landId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDigitalTwinQuery(landId?: string) {
  return useQuery({
    queryKey: ['digital-twin', landId],
    queryFn: () => (landId ? digitalTwinService.getDigitalTwinByLandId(landId) : null),
    enabled: !!landId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwnershipHistoryQuery(landId?: string) {
  return useQuery({
    queryKey: ['ownership-history', landId],
    queryFn: () => (landId ? ownershipService.getOwnershipHistory(landId) : null),
    enabled: !!landId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocumentsQuery(landId?: string) {
  return useQuery({
    queryKey: ['documents', landId],
    queryFn: () => (landId ? documentService.getPermittedDocuments(landId) : []),
    enabled: !!landId,
    staleTime: 1000 * 10, // 10 secs cache to refresh newly uploaded files
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      landId,
      file,
      documentType,
      documentName,
    }: {
      landId: string;
      file?: File;
      documentType?: string;
      documentName?: string;
    }) => documentService.uploadDocument(landId, file, documentType, documentName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.landId] });
      queryClient.invalidateQueries({ queryKey: ['digital-twin', variables.landId] });
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
    },
  });
}

export function useDeleteDocumentMutation(landId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => documentService.deleteDocument(docId),
    onSuccess: () => {
      if (landId) {
        queryClient.invalidateQueries({ queryKey: ['documents', landId] });
        queryClient.invalidateQueries({ queryKey: ['digital-twin', landId] });
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
    },
  });
}

export function useVerificationsQuery(landId?: string) {
  return useQuery({
    queryKey: ['verifications', landId],
    queryFn: () => (landId ? verificationService.getLandVerifications(landId) : []),
    enabled: !!landId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: ['search-parcels', query],
    queryFn: () => searchService.searchParcels(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 30,
  });
}

export function useStatesQuery() {
  return useQuery({
    queryKey: ['location-states'],
    queryFn: () => locationService.getStates(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useDistrictsQuery(stateId?: string) {
  return useQuery({
    queryKey: ['location-districts', stateId],
    queryFn: () => (stateId ? locationService.getDistricts(stateId) : []),
    enabled: !!stateId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTaluksQuery(districtId?: string) {
  return useQuery({
    queryKey: ['location-taluks', districtId],
    queryFn: () => (districtId ? locationService.getTaluks(districtId) : []),
    enabled: !!districtId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useVillagesQuery(talukId?: string) {
  return useQuery({
    queryKey: ['location-villages', talukId],
    queryFn: () => (talukId ? locationService.getVillages(talukId) : []),
    enabled: !!talukId,
    staleTime: 1000 * 60 * 30,
  });
}
