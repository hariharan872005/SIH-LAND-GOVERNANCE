export type VerificationPillarStatus = 'VERIFIED' | 'PENDING' | 'IN_REVIEW' | 'REJECTED' | 'REQUIRES_CORRECTION' | 'NOT_APPLICABLE';

export type OverallVerificationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'REQUIRES_SURVEY'
  | 'SURVEY_VERIFIED'
  | 'REQUIRES_REGISTRATION_VERIFICATION'
  | 'REGISTRATION_VERIFIED'
  | 'REQUIRES_MUNICIPAL_VERIFICATION'
  | 'MUNICIPAL_VERIFIED'
  | 'LAND_VERIFIED'
  | 'REJECTED'
  | 'REQUIRES_CORRECTION'
  // Backward compatibility alias
  | 'VERIFIED'
  | 'PENDING'
  | 'DISPUTED';

export type OfficerRole = 'SUPER_ADMIN' | 'TAHSILDAR' | 'SURVEYOR' | 'SUB_REGISTRAR' | 'REVENUE_OFFICER';

export type DepartmentCode = 'REVENUE' | 'SURVEY' | 'REGISTRATION' | 'MUNICIPALITY' | 'SYSTEM';

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';
export type DesignationStatus = 'ACTIVE' | 'INACTIVE';
export type OfficerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type LandType = 'AGRICULTURAL' | 'COMMERCIAL' | 'RESIDENTIAL' | 'INDUSTRIAL' | 'GOVERNMENT' | 'FOREST';

export interface GeoHierarchyScope {
  country: 'India';
  state: string;
  district: string;
  taluk?: string;
  village?: string;
  stateId?: string;
  districtId?: string;
  talukId?: string;
  villageId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  designationCount: number;
  officerCount: number;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  departmentName: string;
  officerCount: number;
  status: DesignationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Officer {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  password?: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationTitle: string;
  roleId: string;
  roleName: string;
  scope: GeoHierarchyScope;
  status: OfficerStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaUser {
  id: string;
  name: string;
  role: OfficerRole;
  designation: string;
  departmentName: string;
  departmentCode: DepartmentCode;
  employeeId: string;
  email: string;
  scope: GeoHierarchyScope;
  permissions: PermissionCode[];
}

export interface PillarVerificationDetail {
  status: VerificationPillarStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  comments?: string;
  referenceDocId?: string;
}

export interface LandVerificationMatrix {
  revenue: PillarVerificationDetail;
  survey: PillarVerificationDetail;
  registration: PillarVerificationDetail;
  municipality: PillarVerificationDetail;
}

// Normalized single LAND_VERIFICATION table record
export interface LandVerificationRecord {
  id: string;
  landId: string;
  departmentId: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  status: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REQUIRES_CORRECTION';
  remarks: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GISCoordinates {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
  center: [number, number]; // [lat, lng]
}

export interface LandParcel {
  id: string;
  landId: string; // e.g. TN-CHE-101
  surveyNumber: string;
  subDivisionNumber?: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  areaInSqMeters: number;
  areaInAcres: number;
  landType: LandType;
  marketValueINR: number;
  currentOwnerName: string;
  currentOwnerIdHash: string; // Government approved identifier reference
  currentOwnerAadhaarMasked?: string;
  ownershipType: 'INDIVIDUAL' | 'JOINT' | 'CORPORATE' | 'TRUST' | 'GOVERNMENT';
  overallStatus: OverallVerificationStatus;
  isDisputed: boolean;
  disputeDetails?: string;
  createdAt: string;
  lastUpdated: string;
}

// Neo4j Graph Models
export interface OwnershipNode {
  id: string;
  name: string;
  panOrAadhaarHash: string;
  ownershipType: 'PRIMARY' | 'INDIVIDUAL' | 'JOINT' | 'CORPORATE' | 'TRUST' | 'GOVERNMENT';
  ownershipPercentage: number;
  acquiredDate: string;
  deedRegistrationNumber: string;
  mutationId?: string;
  considerationAmountINR: number;
  isCurrentOwner: boolean;
  status: 'CLEAR' | 'DISPUTED' | 'UNDER_CHARGE' | 'HISTORICAL' | 'CURRENT';
  previousOwnerId?: string;
  relinquishedDate?: string;
}

export interface Neo4jTransactionNode {
  id: string;
  transactionRef: string;
  deedNumber: string;
  registrationDate: string;
  transferType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'PARTITION' | 'GOVT_ALLOTMENT';
  considerationINR: number;
  fromOwnerId: string;
  fromOwnerName: string;
  toOwnerId: string;
  toOwnerName: string;
  landId: string;
  subRegistrarOffice: string;
  documentHash: string;
}

export interface DigitalTwinDetail extends LandParcel {
  verificationMatrix: LandVerificationMatrix;
  normalizedVerifications?: LandVerificationRecord[];
  gisBoundary: GISCoordinates;
  geoServerLayerName: string;
  postGisTable: string;
  elevationMeters: number;
  soilClassification: string;
  landUseZoning: string;
  encumbranceStatus: 'FREE' | 'MORTGAGED' | 'GOVT_ACQUISITION' | 'LITIGATION';
  encumbranceDetails?: string;
  taxClearanceUptoYear: number;
  propertyId?: string;
  buildingInfo?: {
    builtUpAreaSqFt?: number;
    floors?: number;
    occupancyStatus?: string;
    approvalNumber?: string;
  };
  ownershipLineage: OwnershipNode[];
  transactions?: Neo4jTransactionNode[];
  linkedDocuments: DocumentRecord[];
  auditHistoryCount: number;
}

export interface DocumentRecord {
  id: string;
  documentName: string;
  documentType: 'SALE_DEED' | 'PATTA_CHITTA' | '7_12_EXTRACT' | 'SURVEY_FMB' | 'ENCUMBRANCE_CERTIFICATE' | 'TAX_RECEIPT' | 'MUTATION_ORDER' | 'SURVEY_DOCUMENT' | 'REGISTRATION_DOCUMENT' | 'PROPERTY_DOCUMENT';
  landId: string;
  uploadedByOfficerId?: string;
  uploadedByOfficerName?: string;
  departmentId?: string;
  departmentName?: string;
  fileSizeBytes: number;
  mimeType?: string;
  s3Bucket?: string;
  s3Key?: string;
  s3Url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  uploadDate?: string;
  uploadedAt?: string;
  sha256Hash?: string;
  documentHash?: string;
  metadata?: {
    hashMD5?: string;
    scannerModel?: string;
    verifiedSignature?: string;
  };
}

export interface AuditLogRecord {
  id: string;
  auditId?: string;
  actorId?: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  departmentName: string;
  action: 
    | 'LAND_CREATED'
    | 'LAND_UPDATED'
    | 'SURVEY_SUBMITTED'
    | 'BOUNDARY_UPDATED'
    | 'LAND_VERIFIED'
    | 'REGISTRATION_VERIFIED'
    | 'OWNER_TRANSFERRED'
    | 'MUNICIPAL_VERIFIED'
    | 'DOCUMENT_UPLOADED'
    | 'VERIFICATION_REJECTED'
    | 'REQUIRES_CORRECTION'
    | 'OFFICER_CREATED'
    | 'OFFICER_STATUS_CHANGED'
    | 'PERMISSION_CHANGED'
    | 'DEPARTMENT_CREATED'
    | 'DESIGNATION_CREATED';
  module: 'LAND_GOVERNANCE' | 'ORGANIZATION' | 'ACCESS_CONTROL' | 'DOCUMENTS' | 'DIGITAL_TWIN';
  landId?: string;
  previousValue?: Record<string, any> | string | null;
  newValue?: Record<string, any> | string | null;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export type PermissionCode = 
  // Revenue
  | 'VIEW_LAND'
  | 'CREATE_LAND_PARCEL'
  | 'VIEW_GIS'
  | 'VERIFY_OWNERSHIP'
  | 'APPROVE_MUTATION'
  | 'VIEW_TRANSFER_HISTORY'
  | 'VIEW_DOCUMENTS'
  // Survey
  | 'CREATE_SURVEY'
  | 'UPDATE_PROPOSED_BOUNDARY'
  | 'UPLOAD_SURVEY'
  | 'SUBMIT_VERIFICATION'
  | 'DEMARCATE_BOUNDARY'
  // Registration
  | 'VERIFY_REGISTRATION'
  | 'EXECUTE_OWNERSHIP_TRANSFER'
  | 'UPLOAD_REGISTRATION_DOCUMENT'
  | 'VIEW_OWNERSHIP'
  // Municipality
  | 'VIEW_PROPERTY'
  | 'VERIFY_PROPERTY'
  | 'VERIFY_TAX'
  | 'VERIFY_BUILDING_LAYOUT'
  // Super Admin / Governance
  | 'MANAGE_DEPARTMENTS'
  | 'MANAGE_DESIGNATIONS'
  | 'MANAGE_OFFICERS'
  | 'MANAGE_ROLES'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_SETTINGS'
  | 'VIEW_DIGITAL_TWINS';

export interface Permission {
  id: string;
  code: PermissionCode;
  name: string;
  departmentId?: string;
  category: 'REVENUE' | 'SURVEY' | 'REGISTRATION' | 'MUNICIPALITY' | 'SYSTEM';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationTitle: string;
  description: string;
  permissions: PermissionCode[];
  isSystemRole: boolean;
  officerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalParcels: number;
  verifiedParcels: number;
  pendingVerification: number;
  disputedParcels: number;
  totalOfficers: number;
  activeDepartments: number;
  monthlyTrends: {
    month: string;
    verified: number;
    pending: number;
    rejected: number;
  }[];
  departmentVerificationRate: {
    department: string;
    verified: number;
    pending: number;
    rejected: number;
  }[];
  landTypeDistribution: {
    type: string;
    count: number;
    areaHectares: number;
  }[];
  recentActivity: {
    id: string;
    landId: string;
    surveyNumber: string;
    state: string;
    action: string;
    department: string;
    officerName: string;
    timestamp: string;
    status: OverallVerificationStatus;
  }[];
  recentOfficerActivity: AuditLogRecord[];
}

export interface LandFilterParams {
  state?: string;
  district?: string;
  taluk?: string;
  landType?: string;
  status?: string;
  search?: string;
}

export interface OfficerFilterParams {
  state?: string;
  departmentId?: string;
  status?: string;
  search?: string;
}

export interface DocumentFilterParams {
  landId?: string;
  documentType?: string;
  search?: string;
}

export interface AuditFilterParams {
  officerId?: string;
  landId?: string;
  module?: string;
  action?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
