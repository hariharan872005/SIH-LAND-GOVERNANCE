export type OverallVerificationStatus =
  | 'REQUIRES_SURVEY'
  | 'REQUIRES_REGISTRATION_VERIFICATION'
  | 'REQUIRES_MUNICIPAL_VERIFICATION'
  | 'LAND_VERIFIED'
  | 'REQUIRES_CORRECTION'
  | 'REJECTED';

export type LandType = 'AGRICULTURAL' | 'COMMERCIAL' | 'RESIDENTIAL' | 'INDUSTRIAL' | 'GOVERNMENT' | 'FOREST' | 'WATER_BODY';

export interface GISCoordinates {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
  center?: [number, number]; // [lat, lng]
}

export interface LandOwner {
  id: string;
  landId: string;
  ownerName: string;
  ownerIdHash: string;
  maskedAadhaarOrId?: string;
  ownershipType: 'INDIVIDUAL' | 'JOINT' | 'CORPORATE' | 'TRUST' | 'GOVERNMENT';
  ownershipPercentage: string;
  isCurrentOwner: boolean;
  acquiredDate?: string;
  deedRegistrationNumber?: string;
  mutationDocketNumber?: string;
  considerationAmountINR?: string;
}

export interface LandVerificationRecord {
  id: string;
  landId: string;
  departmentId: string;
  departmentName?: string;
  officerId?: string;
  officerName?: string;
  officerDesignation?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REQUIRES_CORRECTION';
  remarks?: string;
  referenceDocketNumber?: string;
  submittedAt?: string;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface LandParcel {
  id: string;
  landId: string;
  surveyNumber: string;
  subdivisionNumber?: string;
  stateId: string;
  districtId: string;
  talukId: string;
  villageId: string;
  landType: LandType;
  classification?: string;
  registeredArea: string | number;
  measuredArea?: string | number;
  marketValueINR: string | number;
  status: OverallVerificationStatus;
  gisCoordinatesJson?: GISCoordinates | null;
  geoServerLayerName?: string;
  isDisputed: boolean;
  disputeDetails?: string;
  createdByOfficerId?: string;
  createdAt: string;
  updatedAt: string;
  state?: { id: string; name: string; code: string };
  district?: { id: string; name: string };
  taluk?: { id: string; name: string };
  village?: { id: string; name: string };
  owners?: LandOwner[];
  verifications?: LandVerificationRecord[];
}

export interface DigitalTwinDetail {
  landId: string;
  surveyNumber: string;
  subdivisionNumber?: string;
  location: {
    state: string;
    district: string;
    taluk: string;
    village: string;
  };
  landType: LandType;
  areaInAcres: number;
  marketValueINR: number;
  overallStatus: OverallVerificationStatus;
  hasGisBoundary: boolean;
  gisCoordinates?: GISCoordinates;
  currentOwnerName?: string;
  currentOwnerType?: string;
  transferCount: number;
  isDisputed: boolean;
  disputeDetails?: string;
  verifications: {
    revenue: 'VERIFIED' | 'PENDING' | 'REQUIRES_CORRECTION' | 'REJECTED';
    survey: 'VERIFIED' | 'PENDING' | 'REQUIRES_CORRECTION' | 'REJECTED';
    registration: 'VERIFIED' | 'PENDING' | 'REQUIRES_CORRECTION' | 'REJECTED';
    municipality: 'VERIFIED' | 'PENDING' | 'REQUIRES_CORRECTION' | 'REJECTED';
  };
  ownershipLineage: OwnershipTransferNode[];
  documentsCount: number;
  auditCount: number;
}

export interface OwnershipTransferNode {
  id: string;
  landId: string;
  previousOwnerName: string;
  newOwnerName: string;
  transferType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'PARTITION' | 'GOVT_ALLOTMENT';
  deedNumber: string;
  registrationDate: string;
  considerationAmountINR?: number;
  sroOffice?: string;
  transactionHash?: string;
  isCurrentOwner: boolean;
}

export interface OwnershipHistory {
  landId: string;
  currentOwner?: {
    name: string;
    type: string;
    acquiredDate?: string;
    deedNumber?: string;
  };
  lineage: OwnershipTransferNode[];
}

export interface DocumentRecord {
  id: string;
  landId: string;
  fileName: string;
  documentType: 'SALE_DEED' | 'PATTA_CHITTA' | '7_12_EXTRACT' | 'SURVEY_FMB' | 'ENCUMBRANCE_CERTIFICATE' | 'TAX_RECEIPT' | 'MUTATION_ORDER';
  fileSizeBytes: number;
  s3PresignedUrl?: string;
  ipfsCid?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface LocationState {
  id: string;
  name: string;
  code: string;
}

export interface LocationDistrict {
  id: string;
  name: string;
  stateId: string;
}

export interface LocationTaluk {
  id: string;
  name: string;
  districtId: string;
}

export interface LocationVillage {
  id: string;
  name: string;
  talukId: string;
}
