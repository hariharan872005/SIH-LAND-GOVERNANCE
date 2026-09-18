import { apiClient } from './apiClient';
import {
  DepartmentCode,
  DigitalTwinDetail,
  LandFilterParams,
  LandVerificationRecord,
  PersonaUser,
  PillarVerificationDetail,
} from '../types';

type ApiEnvelope<T> = { data: T };

const departmentByPillar = {
  revenue: 'dept_rev_01',
  survey: 'dept_surv_02',
  registration: 'dept_reg_03',
  municipality: 'dept_muni_04',
} as const;

const departmentCodeById: Record<string, DepartmentCode> = {
  dept_rev_01: 'REVENUE',
  dept_surv_02: 'SURVEY',
  dept_reg_03: 'REGISTRATION',
  dept_muni_04: 'MUNICIPALITY',
};

const departmentNameByCode: Record<DepartmentCode, string> = {
  REVENUE: 'Revenue / Land Records',
  SURVEY: 'Survey & Land Records',
  REGISTRATION: 'Registration & Stamps',
  MUNICIPALITY: 'Municipality / Local Body',
  SYSTEM: 'National Governance Controller',
};

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const verificationDetail = (parcel: any, pillar: keyof typeof departmentByPillar): PillarVerificationDetail => {
  const record = (parcel.verifications || []).find(
    (item: any) => item.departmentId === departmentByPillar[pillar],
  );
  return {
    status: record?.status || 'PENDING',
    verifiedBy: record?.officer?.fullName,
    verifiedAt: record?.verifiedAt || undefined,
    comments: record?.remarks || undefined,
    referenceDocId: record?.referenceDocketNumber || undefined,
  };
};

const verificationRecord = (record: any, publicLandId: string): LandVerificationRecord => {
  const departmentCode = (
    record.department?.code || departmentCodeById[record.departmentId] || 'SYSTEM'
  ) as DepartmentCode;
  return {
    id: record.id,
    landId: publicLandId,
    departmentId: record.departmentId,
    departmentCode,
    departmentName: record.department?.name || departmentNameByCode[departmentCode],
    officerId: record.officerId || '',
    officerName: record.officer?.fullName || 'Pending Assignment',
    officerDesignation: record.officer?.designation?.title || departmentNameByCode[departmentCode],
    status: record.status,
    remarks: record.remarks || '',
    verifiedAt: record.verifiedAt || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const toDigitalTwin = (parcel: any): DigitalTwinDetail => {
  const currentOwner = (parcel.owners || []).find((owner: any) => owner.isCurrentOwner) || parcel.owners?.[0];
  const boundary = parcel.gisCoordinatesJson || { type: 'Polygon', coordinates: [] };
  const ring: number[][] = boundary.coordinates?.[0] || [];
  const center: [number, number] = ring.length
    ? [
        ring.reduce((sum, point) => sum + numberValue(point[1]), 0) / ring.length,
        ring.reduce((sum, point) => sum + numberValue(point[0]), 0) / ring.length,
      ]
    : [13.115, 80.155];

  return {
    id: parcel.id,
    landId: parcel.landId,
    surveyNumber: parcel.surveyNumber,
    subDivisionNumber: parcel.subdivisionNumber,
    state: parcel.state?.name || parcel.stateId,
    district: parcel.district?.name || parcel.districtId,
    taluk: parcel.taluk?.name || parcel.talukId,
    village: parcel.village?.name || parcel.villageId,
    areaInSqMeters: Math.round(numberValue(parcel.measuredArea || parcel.registeredArea) * 4046.86),
    areaInAcres: numberValue(parcel.measuredArea || parcel.registeredArea),
    landType: parcel.landType,
    marketValueINR: numberValue(parcel.marketValueINR),
    currentOwnerName: currentOwner?.ownerName || 'Ownership record pending',
    currentOwnerIdHash: currentOwner?.ownerIdHash || '',
    currentOwnerAadhaarMasked: currentOwner?.maskedAadhaarOrId,
    ownershipType: currentOwner?.ownershipType || 'INDIVIDUAL',
    overallStatus: parcel.status,
    isDisputed: Boolean(parcel.isDisputed),
    disputeDetails: parcel.disputeDetails || undefined,
    createdAt: parcel.createdAt,
    lastUpdated: parcel.updatedAt,
    verificationMatrix: {
      revenue: verificationDetail(parcel, 'revenue'),
      survey: verificationDetail(parcel, 'survey'),
      registration: verificationDetail(parcel, 'registration'),
      municipality: verificationDetail(parcel, 'municipality'),
    },
    normalizedVerifications: (parcel.verifications || []).map((record: any) =>
      verificationRecord(record, parcel.landId),
    ),
    gisBoundary: {
      type: boundary.type || 'Polygon',
      coordinates: boundary.coordinates || [],
      center,
    },
    geoServerLayerName: parcel.geoServerLayerName || 'national_cadastre:parcel_poly',
    postGisTable: 'public.land_parcels',
    elevationMeters: 0,
    soilClassification: parcel.classification || 'Survey classification pending',
    landUseZoning: parcel.classification || parcel.landType,
    encumbranceStatus: parcel.isDisputed ? 'LITIGATION' : 'FREE',
    encumbranceDetails: parcel.disputeDetails || undefined,
    taxClearanceUptoYear: 0,
    ownershipLineage: (parcel.owners || []).map((owner: any) => ({
      id: owner.id,
      name: owner.ownerName,
      panOrAadhaarHash: owner.ownerIdHash,
      ownershipType: owner.ownershipType,
      ownershipPercentage: numberValue(owner.ownershipPercentage, 100),
      acquiredDate: owner.acquiredDate,
      deedRegistrationNumber: owner.deedRegistrationNumber || '',
      considerationAmountINR: numberValue(owner.considerationAmountINR),
      isCurrentOwner: Boolean(owner.isCurrentOwner),
      status: owner.isCurrentOwner ? 'CURRENT' : 'HISTORICAL',
      relinquishedDate: owner.relinquishedDate || undefined,
    })),
    transactions: (parcel.transactions || []).map((transaction: any) => ({
      id: transaction.id,
      transactionRef: transaction.registrationNumber || transaction.id,
      deedNumber: transaction.deedNumber,
      registrationDate: transaction.registrationDate,
      transferType: transaction.transferType,
      considerationINR: numberValue(transaction.considerationAmountINR),
      fromOwnerId: transaction.fromOwnerId,
      fromOwnerName: transaction.fromOwnerName,
      toOwnerId: transaction.toOwnerId,
      toOwnerName: transaction.toOwnerName,
      landId: parcel.landId,
      subRegistrarOffice: transaction.subRegistrarOffice,
      documentHash: transaction.documentHash || '',
    })),
    linkedDocuments: (parcel.documents || []).map((document: any) => ({
      id: document.id,
      documentName: document.documentName,
      documentType: document.documentType,
      landId: parcel.landId,
      uploadedByOfficerId: document.uploadedByOfficerId,
      uploadedByOfficerName: document.uploadedByOfficer?.fullName || 'Government Officer',
      departmentId: document.departmentId || '',
      departmentName: document.department?.name || 'Land Governance',
      fileSizeBytes: numberValue(document.fileSizeBytes),
      mimeType: document.mimeType,
      s3Bucket: 'gov-land-vault-prod',
      s3Key: document.storageKey,
      s3Url: document.downloadUrl || document.s3Url,
      verificationStatus: document.verificationStatus,
      uploadDate: document.createdAt,
      metadata: {
        hashMD5: document.documentHash || '',
        ...document.metadata,
      },
    })),
    auditHistoryCount: 0,
  };
};

const fetchLandById = async (landId: string): Promise<DigitalTwinDetail> => {
  const response = await apiClient.get<ApiEnvelope<any>>(`/lands/${encodeURIComponent(landId)}`);
  return toDigitalTwin(response.data.data);
};

const migrateLegacyCreatedParcels = async (): Promise<void> => {};

const withFallback = async <T>(apiCall: () => Promise<T>, _fallback?: () => Promise<T> | T): Promise<T> => {
  return await apiCall();
};

export const landService = {
  async getAll(params?: LandFilterParams): Promise<DigitalTwinDetail[]> {
    return withFallback(async () => {
      await migrateLegacyCreatedParcels();
      const response = await apiClient.get<ApiEnvelope<any[]>>('/lands', {
        params: {
          page: 1,
          pageSize: 200,
          search: params?.search,
          status: params?.status === 'ALL' ? undefined : params?.status,
          landType: params?.landType === 'ALL' ? undefined : params?.landType,
          stateId: params?.state === 'ALL' ? undefined : params?.state,
          districtId: params?.district === 'ALL' ? undefined : params?.district,
          talukId: params?.taluk === 'ALL' ? undefined : params?.taluk,
        },
      });
      return response.data.data.map(toDigitalTwin);
    });
  },

  async getById(landId: string): Promise<DigitalTwinDetail | undefined> {
    return withFallback(async () => {
      await migrateLegacyCreatedParcels();
      return fetchLandById(landId);
    });
  },

  async createByTahsildar(
    tahsildar: PersonaUser,
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
    },
  ): Promise<DigitalTwinDetail> {
    return withFallback(async () => {
      const stateId = tahsildar.scope?.stateId || 'state_tn';
      const districtId = tahsildar.scope?.districtId || 'dist_che';
      const talukId = tahsildar.scope?.talukId || 'taluk_amb';
      const villageId = tahsildar.scope?.villageId || 'vil_amb_ot';

      await apiClient.post('/lands', {
        landId: data.landId,
        surveyNumber: data.surveyNumber,
        subdivisionNumber: data.subDivisionNumber || '1',
        stateId,
        districtId,
        talukId,
        villageId,
        landType: data.landType,
        registeredArea: data.areaInAcres,
        marketValueINR: data.marketValueINR,
        ownerName: data.ownerName,
        ownerIdHash: data.ownerIdHash,
        ownershipType: data.ownershipType,
        existingLandRecordRef: data.existingLandRecordRef,
      });
      return fetchLandById(data.landId);
    });
  },

  async submitSurveyVerification(
    surveyor: PersonaUser,
    data: {
      landId: string;
      measuredAreaAcres: number;
      polygonCoordinates: number[][];
      surveyRemarks: string;
      surveyDocName?: string;
    },
  ): Promise<DigitalTwinDetail> {
    return withFallback(async () => {
      await apiClient.post('/surveys/submit-verification', data);
      return fetchLandById(data.landId);
    });
  },

  async submitRegistrationAndTransfer(
    subRegistrar: PersonaUser,
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
    },
  ): Promise<DigitalTwinDetail> {
    return withFallback(async () => {
      await apiClient.post('/transfers', data);
      return fetchLandById(data.landId);
    });
  },

  async submitMunicipalVerification(
    revenueOfficer: PersonaUser,
    data: {
      landId: string;
      propertyId: string;
      taxClearanceYear: number;
      builtUpAreaSqFt?: number;
      occupancyStatus?: string;
      remarks: string;
    },
  ): Promise<DigitalTwinDetail> {
    return withFallback(async () => {
      await apiClient.post('/municipal/verify', data);
      return fetchLandById(data.landId);
    });
  },

  async flagCorrectionOrReject(
    officer: PersonaUser,
    landId: string,
    pillar: 'revenue' | 'survey' | 'registration' | 'municipality',
    actionType: 'REJECTED' | 'REQUIRES_CORRECTION',
    reason: string,
  ): Promise<DigitalTwinDetail> {
    return withFallback(async () => {
      await apiClient.post('/verifications/flag-correction', {
        landId,
        departmentId: departmentByPillar[pillar],
        action: actionType,
        reason,
      });
      return fetchLandById(landId);
    });
  },

  async getNormalizedVerifications(landId?: string): Promise<LandVerificationRecord[]> {
    if (!landId) return [];
    return withFallback(async () => {
      const response = await apiClient.get<ApiEnvelope<any[]>>(
        `/verifications/land/${encodeURIComponent(landId)}`,
      );
      return response.data.data.map((record) => verificationRecord(record, landId));
    });
  },
};

export const digitalTwinService = {
  async getDetails(landId: string): Promise<DigitalTwinDetail | undefined> {
    return landService.getById(landId);
  },
};

export const verificationService = {
  async updatePillar(
    landId: string,
    pillar: 'revenue' | 'survey' | 'registration' | 'municipality',
    details: PillarVerificationDetail,
  ): Promise<DigitalTwinDetail> {
    const action = details.status === 'REJECTED' ? 'REJECTED' : 'REQUIRES_CORRECTION';
    await apiClient.post('/verifications/flag-correction', {
      landId,
      departmentId: departmentByPillar[pillar],
      action,
      reason: details.comments || 'Verification status updated by department officer.',
    });
    return fetchLandById(landId);
  },
};
