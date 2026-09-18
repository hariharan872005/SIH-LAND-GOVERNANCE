import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  departmentService,
  CreateDepartmentDto,
  designationService,
  CreateDesignationDto,
  officerService,
  CreateOfficerDto,
  landService,
  digitalTwinService,
  verificationService,
  roleService,
  CreateRoleDto,
  permissionService,
  documentService,
  auditService,
  AuditFilterParams,
  dashboardService,
  authService,
} from '../services';
import {
  LandFilterParams,
  OfficerFilterParams,
  DocumentFilterParams,
  PillarVerificationDetail,
  DigitalTwinDetail,
  PersonaUser,
} from '../types';

// =================== DEPARTMENTS ===================
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepartmentDto) => departmentService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateDepartmentDto> }) =>
      departmentService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useToggleDepartmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
};

// =================== DESIGNATIONS ===================
export const useDesignations = (departmentId?: string) => {
  return useQuery({
    queryKey: ['designations', departmentId],
    queryFn: () =>
      departmentId && departmentId !== 'ALL'
        ? designationService.getByDepartment(departmentId)
        : designationService.getAll(),
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDesignationDto) => designationService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateDesignationDto> }) =>
      designationService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useToggleDesignationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
  });
};

// =================== OFFICERS ===================
export const useOfficers = (params?: OfficerFilterParams) => {
  return useQuery({
    queryKey: ['officers', params],
    queryFn: () => officerService.getAll(params),
  });
};

export const useOfficerActivityLogs = (officerId: string) => {
  return useQuery({
    queryKey: ['officerActivityLogs', officerId],
    queryFn: () => auditService.getAll({ officerId }),
    enabled: Boolean(officerId),
  });
};

export const useCreateOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOfficerDto) => officerService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useUpdateOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateOfficerDto> }) =>
      officerService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useToggleOfficerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useResetOfficerAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerService.resetAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useDeleteOfficer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// =================== LAND & VERIFICATION ===================
export const useLandParcels = (params?: LandFilterParams) => {
  return useQuery({
    queryKey: ['landParcels', params],
    queryFn: () => landService.getAll(params),
  });
};

export const useDigitalTwin = (landId: string) => {
  return useQuery({
    queryKey: ['digitalTwin', landId],
    queryFn: () => digitalTwinService.getDetails(landId),
    enabled: Boolean(landId),
  });
};

export const useNormalizedVerifications = (landId?: string) => {
  return useQuery({
    queryKey: ['normalizedVerifications', landId],
    queryFn: () => landService.getNormalizedVerifications(landId),
  });
};

// 1. Tahsildar Parcel Creation
export const useCreateParcelByTahsildar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tahsildar,
      data,
    }: {
      tahsildar: PersonaUser;
      data: {
        landId: string;
        surveyNumber: string;
        subDivisionNumber?: string;
        landType: DigitalTwinDetail['landType'];
        areaInAcres: number;
        marketValueINR: number;
        ownerName: string;
        ownerIdHash: string;
        ownershipType: DigitalTwinDetail['ownershipType'];
        existingLandRecordRef?: string;
      };
    }) => landService.createByTahsildar(tahsildar, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// 2. Surveyor GIS & Boundary
export const useSubmitSurveyVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      surveyor,
      data,
    }: {
      surveyor: PersonaUser;
      data: {
        landId: string;
        measuredAreaAcres: number;
        polygonCoordinates: number[][];
        surveyRemarks: string;
        surveyDocName?: string;
      };
    }) => landService.submitSurveyVerification(surveyor, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['digitalTwin', variables.data.landId] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// 3. Sub-Registrar Registration & Transfer
export const useSubmitRegistrationAndTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subRegistrar,
      data,
    }: {
      subRegistrar: PersonaUser;
      data: {
        landId: string;
        previousOwnerId?: string;
        previousOwnerName?: string;
        deedNumber: string;
        registrationDate: string;
        transferType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'PARTITION' | 'GOVT_ALLOTMENT';
        newOwnerName: string;
        newOwnerIdHash: string;
        newOwnershipType: DigitalTwinDetail['ownershipType'];
        considerationAmountINR: number;
        sroOffice: string;
        remarks: string;
      };
    }) => landService.submitRegistrationAndTransfer(subRegistrar, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['digitalTwin', variables.data.landId] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// 4. Revenue Officer Municipal Clearance
export const useSubmitMunicipalVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      revenueOfficer,
      data,
    }: {
      revenueOfficer: PersonaUser;
      data: {
        landId: string;
        propertyId: string;
        taxClearanceYear: number;
        builtUpAreaSqFt?: number;
        occupancyStatus?: string;
        remarks: string;
      };
    }) => landService.submitMunicipalVerification(revenueOfficer, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['digitalTwin', variables.data.landId] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// 5. Flag Correction or Reject
export const useFlagCorrectionOrReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      officer,
      landId,
      pillar,
      actionType,
      reason,
    }: {
      officer: PersonaUser;
      landId: string;
      pillar: 'revenue' | 'survey' | 'registration' | 'municipality';
      actionType: 'REJECTED' | 'REQUIRES_CORRECTION';
      reason: string;
    }) => landService.flagCorrectionOrReject(officer, landId, pillar, actionType, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['digitalTwin', variables.landId] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

export const useUpdateVerificationPillar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      landId,
      pillar,
      details,
    }: {
      landId: string;
      pillar: 'revenue' | 'survey' | 'registration' | 'municipality';
      details: PillarVerificationDetail;
    }) => verificationService.updatePillar(landId, pillar, details),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['digitalTwin', variables.landId] });
      queryClient.invalidateQueries({ queryKey: ['normalizedVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// =================== ROLES & PERMISSIONS ===================
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAll(),
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAll(),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoleDto) => roleService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

// =================== DOCUMENTS ===================
export const useDocuments = (params?: DocumentFilterParams) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentService.getAll(params),
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Partial<DigitalTwinDetail['linkedDocuments'][0]> & { documentName: string; landId: string; documentType: DigitalTwinDetail['linkedDocuments'][0]['documentType'] }) =>
      documentService.upload(doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => documentService.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['landParcels'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
};

// =================== AUDIT LOGS ===================
export const useAuditLogs = (params?: AuditFilterParams) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditService.getAll(params),
  });
};

// =================== DASHBOARD & AUTH ===================
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
  });
};
