import { 
  Department, 
  Designation, 
  Officer, 
  Role, 
  DigitalTwinDetail, 
  DocumentRecord, 
  AuditLogRecord,
  DashboardStats 
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_rev_01',
    name: 'Revenue / Land Records',
    code: 'REV-LR',
    description: 'Responsible for Record of Rights (RoR), title maintenance, mutation approvals, and land revenue collection.',
    designationCount: 1,
    officerCount: 6,
    status: 'ACTIVE',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'dept_surv_02',
    name: 'Survey & Land Records',
    code: 'SUR-LR',
    description: 'Responsible for cadastral mapping, DGPS spatial surveys, boundary demarcation, and GeoServer layer creation.',
    designationCount: 1,
    officerCount: 5,
    status: 'ACTIVE',
    createdAt: '2025-01-10T10:15:00Z',
    updatedAt: '2025-01-10T10:15:00Z'
  },
  {
    id: 'dept_reg_03',
    name: 'Registration & Stamps',
    code: 'REG-STP',
    description: 'Responsible for registration of sale deeds, stamp duty verification, encumbrance tracking, and title transfer deeds.',
    designationCount: 1,
    officerCount: 4,
    status: 'ACTIVE',
    createdAt: '2025-01-10T10:30:00Z',
    updatedAt: '2025-01-10T10:30:00Z'
  },
  {
    id: 'dept_mun_04',
    name: 'Municipality / Local Body',
    code: 'MUN-LB',
    description: 'Responsible for town planning, master plan zoning compliance, property assessment, and municipal tax verification.',
    designationCount: 1,
    officerCount: 5,
    status: 'ACTIVE',
    createdAt: '2025-01-10T10:45:00Z',
    updatedAt: '2025-01-10T10:45:00Z'
  }
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  {
    id: 'desig_rev_tahsildar',
    title: 'Tahsildar',
    code: 'TAH-REV',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    officerCount: 6,
    status: 'ACTIVE',
    createdAt: '2025-01-11T09:00:00Z',
    updatedAt: '2025-01-11T09:00:00Z'
  },
  {
    id: 'desig_surv_surveyor',
    title: 'Surveyor',
    code: 'SUR-FLD',
    departmentId: 'dept_surv_02',
    departmentName: 'Survey & Land Records',
    officerCount: 5,
    status: 'ACTIVE',
    createdAt: '2025-01-11T09:15:00Z',
    updatedAt: '2025-01-11T09:15:00Z'
  },
  {
    id: 'desig_reg_subregistrar',
    title: 'Sub-Registrar',
    code: 'SUB-REG',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    officerCount: 4,
    status: 'ACTIVE',
    createdAt: '2025-01-11T09:30:00Z',
    updatedAt: '2025-01-11T09:30:00Z'
  },
  {
    id: 'desig_mun_revenueofficer',
    title: 'Revenue Officer',
    code: 'MUN-REV-OFF',
    departmentId: 'dept_mun_04',
    departmentName: 'Municipality / Local Body',
    officerCount: 5,
    status: 'ACTIVE',
    createdAt: '2025-01-11T09:45:00Z',
    updatedAt: '2025-01-11T09:45:00Z'
  }
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role_tahsildar',
    name: 'Tahsildar Operational Role',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    designationId: 'desig_rev_tahsildar',
    designationTitle: 'Tahsildar',
    description: 'Revenue administration role with mutation approval, RoR verification, and land records access.',
    permissions: [
      'VIEW_LAND',
      'VIEW_GIS',
      'VERIFY_OWNERSHIP',
      'APPROVE_MUTATION',
      'VIEW_TRANSFER_HISTORY',
      'VIEW_DOCUMENTS'
    ],
    isSystemRole: true,
    officerCount: 6,
    createdAt: '2025-01-12T08:00:00Z',
    updatedAt: '2025-01-12T08:00:00Z'
  },
  {
    id: 'role_surveyor',
    name: 'Cadastral Field Surveyor Role',
    departmentId: 'dept_surv_02',
    departmentName: 'Survey & Land Records',
    designationId: 'desig_surv_surveyor',
    designationTitle: 'Surveyor',
    description: 'Cadastral surveying and spatial GeoJSON boundary verification role.',
    permissions: [
      'VIEW_LAND',
      'VIEW_GIS',
      'CREATE_SURVEY',
      'UPDATE_PROPOSED_BOUNDARY',
      'UPLOAD_SURVEY',
      'SUBMIT_VERIFICATION'
    ],
    isSystemRole: true,
    officerCount: 5,
    createdAt: '2025-01-12T08:30:00Z',
    updatedAt: '2025-01-12T08:30:00Z'
  },
  {
    id: 'role_subregistrar',
    name: 'Sub-Registrar Authority Role',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    designationId: 'desig_reg_subregistrar',
    designationTitle: 'Sub-Registrar',
    description: 'Deed registration authority and encumbrance certificate verification.',
    permissions: [
      'VIEW_LAND',
      'VIEW_OWNERSHIP',
      'VERIFY_REGISTRATION',
      'UPLOAD_REGISTRATION_DOCUMENT',
      'VIEW_TRANSFER_HISTORY'
    ],
    isSystemRole: true,
    officerCount: 4,
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z'
  },
  {
    id: 'role_revofficer',
    name: 'Municipal Revenue Officer Role',
    departmentId: 'dept_mun_04',
    departmentName: 'Municipality / Local Body',
    designationId: 'desig_mun_revenueofficer',
    designationTitle: 'Revenue Officer',
    description: 'Municipal property tax and master plan zoning verification.',
    permissions: [
      'VIEW_LAND',
      'VIEW_PROPERTY',
      'VERIFY_PROPERTY',
      'VERIFY_TAX'
    ],
    isSystemRole: true,
    officerCount: 5,
    createdAt: '2025-01-12T09:30:00Z',
    updatedAt: '2025-01-12T09:30:00Z'
  },
  {
    id: 'role_superadmin',
    name: 'Super Admin Executive Authority',
    departmentId: 'dept_rev_01',
    departmentName: 'Governance & National Portal Administration',
    designationId: 'desig_rev_tahsildar',
    designationTitle: 'Chief Land Governance Officer',
    description: 'Full nationwide administrative authority across all verification pillars and system configurations.',
    permissions: [
      'VIEW_LAND',
      'VIEW_GIS',
      'VERIFY_OWNERSHIP',
      'APPROVE_MUTATION',
      'VIEW_TRANSFER_HISTORY',
      'VIEW_DOCUMENTS',
      'CREATE_SURVEY',
      'UPDATE_PROPOSED_BOUNDARY',
      'UPLOAD_SURVEY',
      'SUBMIT_VERIFICATION',
      'VERIFY_REGISTRATION',
      'UPLOAD_REGISTRATION_DOCUMENT',
      'VIEW_OWNERSHIP',
      'VIEW_PROPERTY',
      'VERIFY_PROPERTY',
      'VERIFY_TAX',
      'MANAGE_DEPARTMENTS',
      'MANAGE_DESIGNATIONS',
      'MANAGE_OFFICERS',
      'MANAGE_ROLES',
      'VIEW_AUDIT_LOGS',
      'MANAGE_SETTINGS'
    ],
    isSystemRole: true,
    officerCount: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off_001',
    fullName: 'Ravi Kumar',
    employeeId: 'TN-REV-84920',
    email: 'ravi.kumar@tn.gov.in',
    password: 'Password@123',
    phone: '+91 98401 23456',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    designationId: 'desig_rev_tahsildar',
    designationTitle: 'Tahsildar',
    roleId: 'role_tahsildar',
    roleName: 'Tahsildar Operational Role',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-28T08:15:00Z',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'off_002',
    fullName: 'Karthik Subramanian',
    employeeId: 'TN-SUR-91042',
    email: 'karthik.s@tn.gov.in',
    password: 'Password@123',
    phone: '+91 94440 98765',
    departmentId: 'dept_surv_02',
    departmentName: 'Survey & Land Records',
    designationId: 'desig_surv_surveyor',
    designationTitle: 'Surveyor',
    roleId: 'role_surveyor',
    roleName: 'Cadastral Field Surveyor Role',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Korattur'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-27T17:45:00Z',
    createdAt: '2025-02-05T11:00:00Z',
    updatedAt: '2026-08-15T09:20:00Z'
  },
  {
    id: 'off_003',
    fullName: 'Meenakshi Sundaram',
    employeeId: 'TN-REG-47219',
    email: 'meenakshi.sundaram@tn.gov.in',
    password: 'Password@123',
    phone: '+91 98840 55123',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    designationId: 'desig_reg_subregistrar',
    designationTitle: 'Sub-Registrar',
    roleId: 'role_subregistrar',
    roleName: 'Sub-Registrar Authority Role',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Padi'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-28T07:50:00Z',
    createdAt: '2025-02-10T12:00:00Z',
    updatedAt: '2026-08-18T16:00:00Z'
  },
  {
    id: 'off_004',
    fullName: 'Anandhan Radhakrishnan',
    employeeId: 'TN-MUN-30219',
    email: 'anandhan.r@chennaicorp.gov.in',
    password: 'Password@123',
    phone: '+91 97908 11223',
    departmentId: 'dept_mun_04',
    departmentName: 'Municipality / Local Body',
    designationId: 'desig_mun_revenueofficer',
    designationTitle: 'Revenue Officer',
    roleId: 'role_revofficer',
    roleName: 'Municipal Revenue Officer Role',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Mogappair'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-26T11:20:00Z',
    createdAt: '2025-02-12T14:30:00Z',
    updatedAt: '2026-08-22T10:15:00Z'
  },
  {
    id: 'off_005',
    fullName: 'Suresh Patil',
    employeeId: 'MH-REV-10492',
    email: 'suresh.patil@mahabhumi.gov.in',
    password: 'Password@123',
    phone: '+91 98220 44556',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    designationId: 'desig_rev_tahsildar',
    designationTitle: 'Tahsildar',
    roleId: 'role_tahsildar',
    roleName: 'Tahsildar Operational Role',
    scope: {
      country: 'India',
      state: 'Maharashtra',
      district: 'Pune',
      taluk: 'Haveli',
      village: 'Hinjawadi'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-27T15:10:00Z',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z'
  },
  {
    id: 'off_006',
    fullName: 'Priya Sharma',
    employeeId: 'KA-REV-72941',
    email: 'priya.sharma@karnataka.gov.in',
    password: 'Password@123',
    phone: '+91 99801 88776',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    designationId: 'desig_rev_tahsildar',
    designationTitle: 'Tahsildar',
    roleId: 'role_tahsildar',
    roleName: 'Tahsildar Operational Role',
    scope: {
      country: 'India',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru East',
      village: 'Whitefield'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-28T09:05:00Z',
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z'
  },
  {
    id: 'off_007',
    fullName: 'Venkata Reddy',
    employeeId: 'TS-SUR-50123',
    email: 'venkata.reddy@ccla.telangana.gov.in',
    password: 'Password@123',
    phone: '+91 98480 33445',
    departmentId: 'dept_surv_02',
    departmentName: 'Survey & Land Records',
    designationId: 'desig_surv_surveyor',
    designationTitle: 'Surveyor',
    roleId: 'role_surveyor',
    roleName: 'Cadastral Field Surveyor Role',
    scope: {
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      taluk: 'Serilingampally',
      village: 'HITEC City'
    },
    status: 'ACTIVE',
    lastLogin: '2026-08-25T14:40:00Z',
    createdAt: '2025-03-15T11:30:00Z',
    updatedAt: '2026-08-19T09:40:00Z'
  },
  {
    id: 'off_008',
    fullName: 'Amitabh Verma',
    employeeId: 'UP-REG-61840',
    email: 'amitabh.verma@igrup.gov.in',
    password: 'Password@123',
    phone: '+91 94150 77889',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    designationId: 'desig_reg_subregistrar',
    designationTitle: 'Sub-Registrar',
    roleId: 'role_subregistrar',
    roleName: 'Sub-Registrar Authority Role',
    scope: {
      country: 'India',
      state: 'Uttar Pradesh',
      district: 'Gautam Buddha Nagar',
      taluk: 'Noida',
      village: 'Sector 62'
    },
    status: 'INACTIVE',
    lastLogin: '2026-07-14T10:20:00Z',
    createdAt: '2025-04-01T08:00:00Z',
    updatedAt: '2026-08-01T15:00:00Z'
  }
];

export const INITIAL_PARCELS: DigitalTwinDetail[] = [
  {
    id: 'parcel_tn_101',
    landId: 'TN-CHE-101',
    surveyNumber: '142/3B',
    subDivisionNumber: '3B',
    state: 'Tamil Nadu',
    district: 'Chennai',
    taluk: 'Ambattur',
    village: 'Ambattur OT',
    areaInSqMeters: 4046.86,
    areaInAcres: 1.0,
    landType: 'COMMERCIAL',
    marketValueINR: 85000000,
    currentOwnerName: 'Apex Logistics & Warehousing Pvt Ltd',
    currentOwnerIdHash: 'CIN:U63090TN2018PTC1204',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-9481',
    ownershipType: 'CORPORATE',
    overallStatus: 'PENDING',
    verificationMatrix: {
      revenue: {
        status: 'VERIFIED',
        verifiedBy: 'Ravi Kumar (Tahsildar)',
        verifiedAt: '2026-08-20T11:30:00Z',
        comments: 'Patta Chitta Record #892 verified against Tamil Nilam portal ledger.'
      },
      survey: {
        status: 'VERIFIED',
        verifiedBy: 'Karthik Subramanian (Surveyor)',
        verifiedAt: '2026-08-22T14:15:00Z',
        comments: 'DGPS survey boundary polygon matches physical fencing on site with zero encroachment.'
      },
      registration: {
        status: 'VERIFIED',
        verifiedBy: 'Meenakshi Sundaram (Sub-Registrar)',
        verifiedAt: '2026-08-24T09:45:00Z',
        comments: 'Certified Sale Deed Reg Doc #1948/2023 verified with stamp duty payment.'
      },
      municipality: {
        status: 'PENDING',
        comments: 'Awaiting local zonal clearance certificate and building layout endorsement from GCC Ambattur Zone VII.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [13.1143, 80.1548],
          [13.1165, 80.1552],
          [13.1162, 80.1581],
          [13.1138, 80.1576],
          [13.1143, 80.1548]
        ]
      ],
      center: [13.1152, 80.1564]
    },
    isDisputed: false,
    geoServerLayerName: 'tn_cadastre:ambattur_142_3b',
    postGisTable: 'public.spatial_parcels_tn',
    elevationMeters: 18.4,
    soilClassification: 'Clayey Loam',
    landUseZoning: 'Commercial / Logistics Corridor (C-2)',
    encumbranceStatus: 'FREE',
    taxClearanceUptoYear: 2026,
    ownershipLineage: [
      {
        id: 'node_own_1',
        name: 'Gopalakrishnan Natesan',
        panOrAadhaarHash: 'A***7482K',
        ownershipType: 'PRIMARY',
        ownershipPercentage: 100,
        acquiredDate: '1998-04-12',
        relinquishedDate: '2012-07-19',
        mutationId: 'MUT-TN-1998-492',
        deedRegistrationNumber: 'SRO-AMB-882/1998',
        considerationAmountINR: 1200000,
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_own_2',
        name: 'Vasantha Gopalakrishnan & Sons',
        panOrAadhaarHash: 'B***9918P',
        ownershipType: 'JOINT',
        ownershipPercentage: 100,
        acquiredDate: '2012-07-19',
        relinquishedDate: '2023-11-04',
        mutationId: 'MUT-TN-2012-881',
        deedRegistrationNumber: 'SRO-AMB-4912/2012',
        considerationAmountINR: 28000000,
        previousOwnerId: 'node_own_1',
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_own_3',
        name: 'Apex Logistics & Warehousing Pvt Ltd',
        panOrAadhaarHash: 'C***4401L',
        ownershipType: 'CORPORATE',
        ownershipPercentage: 100,
        acquiredDate: '2023-11-04',
        mutationId: 'MUT-TN-2023-1029',
        deedRegistrationNumber: 'SRO-AMB-1948/2023',
        considerationAmountINR: 85000000,
        previousOwnerId: 'node_own_2',
        status: 'CURRENT',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 8,
    lastUpdated: '2026-08-25T16:00:00Z',
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 'parcel_ka_204',
    landId: 'KA-BLR-204',
    surveyNumber: '88/1A',
    subDivisionNumber: '1A',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru East',
    village: 'Whitefield',
    areaInSqMeters: 8093.71,
    areaInAcres: 2.0,
    landType: 'COMMERCIAL',
    marketValueINR: 220000000,
    currentOwnerName: 'Brigade Horizon Techspaces LLP',
    currentOwnerIdHash: 'LLP:AAH-8819',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-1129',
    ownershipType: 'CORPORATE',
    overallStatus: 'VERIFIED',
    verificationMatrix: {
      revenue: {
        status: 'VERIFIED',
        verifiedBy: 'Priya Sharma (Tahsildar)',
        verifiedAt: '2026-08-10T10:00:00Z',
        comments: 'Bhoomi RTC record cleared; Podi division finalized.'
      },
      survey: {
        status: 'VERIFIED',
        verifiedBy: 'Naveen Gowda (Surveyor)',
        verifiedAt: '2026-08-12T11:45:00Z',
        comments: 'Mojini GIS sketch verified with boundary stone markers.'
      },
      registration: {
        status: 'VERIFIED',
        verifiedBy: 'Kavitha R (Sub-Registrar)',
        verifiedAt: '2026-08-14T14:30:00Z',
        comments: 'Kaveri 2.0 registered title deed #7712/2024 verified with nil encumbrance for 30 years.'
      },
      municipality: {
        status: 'VERIFIED',
        verifiedBy: 'Ramesh Babu (Revenue Officer)',
        verifiedAt: '2026-08-16T16:00:00Z',
        comments: 'BBMP Khata Certificate "A" issued and property tax cleared for 2026-27.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [12.9698, 77.7499],
          [12.9725, 77.7505],
          [12.9721, 77.7542],
          [12.9692, 77.7536],
          [12.9698, 77.7499]
        ]
      ],
      center: [12.9709, 77.7521]
    },
    isDisputed: false,
    geoServerLayerName: 'ka_bhoomi:whitefield_88_1a',
    postGisTable: 'public.spatial_parcels_ka',
    elevationMeters: 890.2,
    soilClassification: 'Red Sandy Clay',
    landUseZoning: 'IT/ITES High-Density Tech Corridor (T-4)',
    encumbranceStatus: 'FREE',
    taxClearanceUptoYear: 2027,
    ownershipLineage: [
      {
        id: 'node_ka_1',
        name: 'Muniyappa Reddy & Brothers',
        panOrAadhaarHash: 'K***5512M',
        ownershipType: 'JOINT',
        ownershipPercentage: 100,
        acquiredDate: '1985-02-14',
        relinquishedDate: '2015-09-22',
        mutationId: 'MUT-KA-1985-110',
        deedRegistrationNumber: 'SRO-KRP-102/1985',
        considerationAmountINR: 450000,
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_ka_2',
        name: 'Brigade Horizon Techspaces LLP',
        panOrAadhaarHash: 'A***8891T',
        ownershipType: 'CORPORATE',
        ownershipPercentage: 100,
        acquiredDate: '2015-09-22',
        mutationId: 'MUT-KA-2015-883',
        deedRegistrationNumber: 'SRO-KRP-7712/2015',
        considerationAmountINR: 220000000,
        previousOwnerId: 'node_ka_1',
        status: 'CURRENT',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 12,
    lastUpdated: '2026-08-16T16:00:00Z',
    createdAt: '2025-01-08T08:30:00Z'
  },
  {
    id: 'parcel_mh_309',
    landId: 'MH-PUN-309',
    surveyNumber: '210/4',
    subDivisionNumber: '4',
    state: 'Maharashtra',
    district: 'Pune',
    taluk: 'Haveli',
    village: 'Hinjawadi',
    areaInSqMeters: 6070.28,
    areaInAcres: 1.5,
    landType: 'INDUSTRIAL',
    marketValueINR: 110000000,
    currentOwnerName: 'Kalyani Automotive Components Ltd',
    currentOwnerIdHash: 'CIN:L27100PN1982PLC0283',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-4091',
    ownershipType: 'CORPORATE',
    overallStatus: 'DISPUTED',
    verificationMatrix: {
      revenue: {
        status: 'REJECTED',
        verifiedBy: 'Suresh Patil (Tahsildar)',
        verifiedAt: '2026-08-18T12:00:00Z',
        comments: 'Injunction order from Civil Court Pune (OS No. 441/2025) halts 7/12 mutation execution.'
      },
      survey: {
        status: 'VERIFIED',
        verifiedBy: 'Milind Deshpande (Surveyor)',
        verifiedAt: '2026-08-11T10:00:00Z',
        comments: 'CTS map demarcation completed; physical boundary verified.'
      },
      registration: {
        status: 'PENDING',
        comments: 'Pending outcome of legal dispute review before SRO Haveli.'
      },
      municipality: {
        status: 'PENDING',
        comments: 'PMRDA development clearance withheld pending litigation status.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [18.5912, 73.7381],
          [18.5936, 73.7389],
          [18.5931, 73.7422],
          [18.5905, 73.7415],
          [18.5912, 73.7381]
        ]
      ],
      center: [18.5921, 73.7402]
    },
    isDisputed: true,
    disputeDetails: 'Civil Suit (OS No. 441/2025) filed by co-heirs claiming ancestral coparcenary rights under Hindu Succession Act.',
    geoServerLayerName: 'mh_mahabhumi:hinjawadi_210_4',
    postGisTable: 'public.spatial_parcels_mh',
    elevationMeters: 565.8,
    soilClassification: 'Medium Black Basaltic Soil',
    landUseZoning: 'Special Industrial & Bio-Tech Zone (I-3)',
    encumbranceStatus: 'LITIGATION',
    encumbranceDetails: 'Civil Court Injunction pending final decree',
    taxClearanceUptoYear: 2025,
    ownershipLineage: [
      {
        id: 'node_mh_1',
        name: 'Dattatray Yashwantrao Gaikwad',
        panOrAadhaarHash: 'M***3391G',
        ownershipType: 'PRIMARY',
        ownershipPercentage: 100,
        acquiredDate: '1976-10-05',
        relinquishedDate: '2018-03-12',
        mutationId: 'MUT-MH-1976-092',
        deedRegistrationNumber: 'SRO-HAV-340/1976',
        considerationAmountINR: 85000,
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_mh_2',
        name: 'Kalyani Automotive Components Ltd',
        panOrAadhaarHash: 'C***9012K',
        ownershipType: 'CORPORATE',
        ownershipPercentage: 100,
        acquiredDate: '2018-03-12',
        mutationId: 'MUT-MH-2018-994',
        deedRegistrationNumber: 'SRO-HAV-6120/2018',
        considerationAmountINR: 110000000,
        previousOwnerId: 'node_mh_1',
        status: 'DISPUTED',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 15,
    lastUpdated: '2026-08-18T12:00:00Z',
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'parcel_ts_412',
    landId: 'TS-HYD-412',
    surveyNumber: '64/2',
    subDivisionNumber: '2',
    state: 'Telangana',
    district: 'Hyderabad',
    taluk: 'Serilingampally',
    village: 'HITEC City',
    areaInSqMeters: 12140.57,
    areaInAcres: 3.0,
    landType: 'COMMERCIAL',
    marketValueINR: 450000000,
    currentOwnerName: 'Cyber Towers Infrastructure Corp',
    currentOwnerIdHash: 'CIN:U70102TG2001PLC0378',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-8002',
    ownershipType: 'CORPORATE',
    overallStatus: 'VERIFIED',
    verificationMatrix: {
      revenue: {
        status: 'VERIFIED',
        verifiedBy: 'Dharani Portal Auto-Sync / CCLA',
        verifiedAt: '2026-08-05T09:00:00Z',
        comments: 'Passbook #TS-994812 cleared with zero government ceiling overlaps.'
      },
      survey: {
        status: 'VERIFIED',
        verifiedBy: 'Venkata Reddy (Surveyor)',
        verifiedAt: '2026-08-07T11:20:00Z',
        comments: 'DGPS CORS network triangulation verified with precision <= 2cm.'
      },
      registration: {
        status: 'VERIFIED',
        verifiedBy: 'Sudhakar Rao (Sub-Registrar)',
        verifiedAt: '2026-08-08T15:00:00Z',
        comments: 'Registered Lease-Cum-Sale Deed #9041/2021 recorded in Registration & Stamps portal.'
      },
      municipality: {
        status: 'VERIFIED',
        verifiedBy: 'GHMC Town Planning Director',
        verifiedAt: '2026-08-09T16:30:00Z',
        comments: 'GHMC Building permit B/10492/2022 approved and property assessment PTIN active.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [17.4475, 78.3752],
          [17.4510, 78.3765],
          [17.4502, 78.3812],
          [17.4468, 78.3798],
          [17.4475, 78.3752]
        ]
      ],
      center: [17.4489, 78.3782]
    },
    isDisputed: false,
    geoServerLayerName: 'ts_dharani:serilingampally_64_2',
    postGisTable: 'public.spatial_parcels_ts',
    elevationMeters: 542.0,
    soilClassification: 'Red Granitic Sandy Loam',
    landUseZoning: 'Special Financial & IT SEZ (SEZ-1)',
    encumbranceStatus: 'FREE',
    taxClearanceUptoYear: 2027,
    ownershipLineage: [
      {
        id: 'node_ts_1',
        name: 'Government of Telangana (TSIIC)',
        panOrAadhaarHash: 'GOVT-TSIIC-HYD',
        ownershipType: 'GOVERNMENT',
        ownershipPercentage: 100,
        acquiredDate: '2001-01-10',
        relinquishedDate: '2019-06-15',
        mutationId: 'TSIIC-ALLOT-2001',
        deedRegistrationNumber: 'GO-MS-88/2001',
        considerationAmountINR: 15000000,
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_ts_2',
        name: 'Cyber Towers Infrastructure Corp',
        panOrAadhaarHash: 'C***7712A',
        ownershipType: 'CORPORATE',
        ownershipPercentage: 100,
        acquiredDate: '2019-06-15',
        mutationId: 'MUT-TS-2019-441',
        deedRegistrationNumber: 'SRO-SRL-9041/2021',
        considerationAmountINR: 450000000,
        previousOwnerId: 'node_ts_1',
        status: 'CURRENT',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 19,
    lastUpdated: '2026-08-09T16:30:00Z',
    createdAt: '2025-01-05T07:00:00Z'
  },
  {
    id: 'parcel_up_518',
    landId: 'UP-GBN-518',
    surveyNumber: '312/1',
    subDivisionNumber: '1',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    taluk: 'Noida',
    village: 'Sector 62',
    areaInSqMeters: 5000.0,
    areaInAcres: 1.23,
    landType: 'RESIDENTIAL',
    marketValueINR: 95000000,
    currentOwnerName: 'Vikas Malhotra & Ananya Malhotra',
    currentOwnerIdHash: 'PAN:AAAPM4819K',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-3349',
    ownershipType: 'JOINT',
    overallStatus: 'PENDING',
    verificationMatrix: {
      revenue: {
        status: 'VERIFIED',
        verifiedBy: 'UP Bhulekh Digital Sync',
        verifiedAt: '2026-08-15T10:00:00Z',
        comments: 'Khatauni record cleared under Tehsil Dadri records.'
      },
      survey: {
        status: 'PENDING',
        comments: 'Awaiting revised drone orthomosaic survey comparison from NOIDA Authority.'
      },
      registration: {
        status: 'VERIFIED',
        verifiedBy: 'Sub-Registrar Noida Sector 33',
        verifiedAt: '2026-08-19T13:00:00Z',
        comments: 'Tripartite Sub-Lease Deed registered under Book 1, Vol 491.'
      },
      municipality: {
        status: 'PENDING',
        comments: 'Noida Authority water and sewer clearance under verification.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [28.6254, 77.3621],
          [28.6280, 77.3630],
          [28.6272, 77.3665],
          [28.6245, 77.3654],
          [28.6254, 77.3621]
        ]
      ],
      center: [28.6263, 77.3642]
    },
    isDisputed: false,
    geoServerLayerName: 'up_bhulekh:noida_sec62_312',
    postGisTable: 'public.spatial_parcels_up',
    elevationMeters: 200.5,
    soilClassification: 'Alluvial Silt Loam',
    landUseZoning: 'Residential Group Housing (R-3)',
    encumbranceStatus: 'FREE',
    taxClearanceUptoYear: 2026,
    ownershipLineage: [
      {
        id: 'node_up_1',
        name: 'New Okhla Industrial Development Authority (NOIDA)',
        panOrAadhaarHash: 'GOVT-NOIDA-AUTH',
        ownershipType: 'GOVERNMENT',
        ownershipPercentage: 100,
        acquiredDate: '1995-01-01',
        relinquishedDate: '2016-04-10',
        mutationId: 'NOIDA-PLOT-ALLOC-95',
        deedRegistrationNumber: 'LEASE-95-0419',
        considerationAmountINR: 8000000,
        status: 'HISTORICAL',
        isCurrentOwner: false
      },
      {
        id: 'node_up_2',
        name: 'Vikas Malhotra & Ananya Malhotra',
        panOrAadhaarHash: 'A***5519M',
        ownershipType: 'JOINT',
        ownershipPercentage: 100,
        acquiredDate: '2016-04-10',
        mutationId: 'MUT-UP-2016-104',
        deedRegistrationNumber: 'SRO-NOI-4910/2016',
        considerationAmountINR: 95000000,
        previousOwnerId: 'node_up_1',
        status: 'CURRENT',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 6,
    lastUpdated: '2026-08-19T13:00:00Z',
    createdAt: '2025-02-01T10:30:00Z'
  },
  {
    id: 'parcel_gj_620',
    landId: 'GJ-AHM-620',
    surveyNumber: '504/A',
    subDivisionNumber: 'A',
    state: 'Gujarat',
    district: 'Ahmedabad',
    taluk: 'Daskroi',
    village: 'Sanand Road',
    areaInSqMeters: 16187.42,
    areaInAcres: 4.0,
    landType: 'AGRICULTURAL',
    marketValueINR: 64000000,
    currentOwnerName: 'Hasmukhbhai Shankarbhai Patel',
    currentOwnerIdHash: 'PAN:AALCP9912M',
    currentOwnerAadhaarMasked: 'XXXX-XXXX-7718',
    ownershipType: 'INDIVIDUAL',
    overallStatus: 'VERIFIED',
    verificationMatrix: {
      revenue: {
        status: 'VERIFIED',
        verifiedBy: 'AnyROR Gujarat Sync / Mamlatdar Sanand',
        verifiedAt: '2026-08-01T10:00:00Z',
        comments: 'E-Dhara village form 7/12 & 8-A verified with no agricultural land ceiling violations.'
      },
      survey: {
        status: 'VERIFIED',
        verifiedBy: 'Gujarat DILR Surveyor Team',
        verifiedAt: '2026-08-03T11:00:00Z',
        comments: 'Re-survey promulagated map boundaries match revenue survey records.'
      },
      registration: {
        status: 'VERIFIED',
        verifiedBy: 'Sub-Registrar Sanand',
        verifiedAt: '2026-08-04T12:00:00Z',
        comments: 'Garvi 2.0 registered ancestral release deed verified.'
      },
      municipality: {
        status: 'NOT_APPLICABLE',
        comments: 'Falls under Gram Panchayat jurisdiction; AUDA TP scheme not yet notified for this sector.'
      }
    },
    gisBoundary: {
      type: 'Polygon',
      coordinates: [
        [
          [22.9812, 72.3685],
          [22.9845, 72.3695],
          [22.9838, 72.3740],
          [22.9802, 72.3728],
          [22.9812, 72.3685]
        ]
      ],
      center: [22.9824, 72.3712]
    },
    isDisputed: false,
    geoServerLayerName: 'gj_anyror:sanand_504_a',
    postGisTable: 'public.spatial_parcels_gj',
    elevationMeters: 53.0,
    soilClassification: 'Black Cotton / Alluvial Deep Clay',
    landUseZoning: 'Agricultural Green Belt (A-1)',
    encumbranceStatus: 'FREE',
    taxClearanceUptoYear: 2026,
    ownershipLineage: [
      {
        id: 'node_gj_1',
        name: 'Hasmukhbhai Shankarbhai Patel',
        panOrAadhaarHash: 'P***8812H',
        ownershipType: 'PRIMARY',
        ownershipPercentage: 100,
        acquiredDate: '2004-05-18',
        mutationId: 'MUT-GJ-2004-129',
        deedRegistrationNumber: 'SRO-SND-4491/2004',
        considerationAmountINR: 1400000,
        status: 'CURRENT',
        isCurrentOwner: true
      }
    ],
    linkedDocuments: [],
    auditHistoryCount: 5,
    lastUpdated: '2026-08-04T12:00:00Z',
    createdAt: '2025-01-28T09:00:00Z'
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc_001',
    documentName: 'Registered Sale Deed - TN-CHE-101.pdf',
    documentType: 'SALE_DEED',
    landId: 'TN-CHE-101',
    uploadedByOfficerId: 'off_003',
    uploadedByOfficerName: 'Meenakshi Sundaram',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    fileSizeBytes: 4892410,
    mimeType: 'application/pdf',
    s3Bucket: 'gov-land-vault-prod-south',
    s3Key: 'documents/tn/chennai/ambattur/142-3b/sale_deed_1948_2023.pdf',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-south/documents/tn/sale_deed_1948_2023.pdf',
    verificationStatus: 'VERIFIED',
    uploadDate: '2026-08-24T09:45:00Z',
    metadata: {
      hashMD5: '8f7a9d3e4c1b2a09f8e7d6c5b4a39281',
      scannerModel: 'Fujitsu fi-7160 High-Res Optical',
      verifiedSignature: 'SHA256:d8a9b2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'
    }
  },
  {
    id: 'doc_002',
    documentName: 'Patta Chitta Passbook - TN-CHE-101.pdf',
    documentType: 'PATTA_CHITTA',
    landId: 'TN-CHE-101',
    uploadedByOfficerId: 'off_001',
    uploadedByOfficerName: 'Ravi Kumar',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    fileSizeBytes: 1245900,
    mimeType: 'application/pdf',
    s3Bucket: 'gov-land-vault-prod-south',
    s3Key: 'documents/tn/chennai/ambattur/142-3b/patta_chitta_892.pdf',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-south/documents/tn/patta_chitta_892.pdf',
    verificationStatus: 'VERIFIED',
    uploadDate: '2026-08-20T11:30:00Z',
    metadata: {
      hashMD5: '5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d',
      verifiedSignature: 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
    }
  },
  {
    id: 'doc_003',
    documentName: 'Cadastral FMB Survey GeoPackage - TN-CHE-101.gpkg',
    documentType: 'SURVEY_FMB',
    landId: 'TN-CHE-101',
    uploadedByOfficerId: 'off_002',
    uploadedByOfficerName: 'Karthik Subramanian',
    departmentId: 'dept_surv_02',
    departmentName: 'Survey & Land Records',
    fileSizeBytes: 18450120,
    mimeType: 'application/geopackage+sqlite3',
    s3Bucket: 'gov-land-vault-prod-south',
    s3Key: 'spatial/tn/chennai/ambattur/142-3b/fmb_vector_demarcation.gpkg',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-south/spatial/tn/fmb_vector_demarcation.gpkg',
    verificationStatus: 'VERIFIED',
    uploadDate: '2026-08-22T14:15:00Z',
    metadata: {
      hashMD5: 'f1e2d3c4b5a60718293a4b5c6d7e8f90',
      scannerModel: 'Trimble R12i GNSS Receiver Data Log'
    }
  },
  {
    id: 'doc_004',
    documentName: 'Kaveri Encumbrance Certificate 30Yr - KA-BLR-204.pdf',
    documentType: 'ENCUMBRANCE_CERTIFICATE',
    landId: 'KA-BLR-204',
    uploadedByOfficerId: 'off_006',
    uploadedByOfficerName: 'Priya Sharma',
    departmentId: 'dept_reg_03',
    departmentName: 'Registration & Stamps',
    fileSizeBytes: 3104800,
    mimeType: 'application/pdf',
    s3Bucket: 'gov-land-vault-prod-south',
    s3Key: 'documents/ka/bengaluru/whitefield/88-1a/kaveri_ec_30yr.pdf',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-south/documents/ka/kaveri_ec_30yr.pdf',
    verificationStatus: 'VERIFIED',
    uploadDate: '2026-08-14T14:30:00Z',
    metadata: {
      hashMD5: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f'
    }
  },
  {
    id: 'doc_005',
    documentName: 'Civil Court Injunction Order - MH-PUN-309.pdf',
    documentType: 'MUTATION_ORDER',
    landId: 'MH-PUN-309',
    uploadedByOfficerId: 'off_005',
    uploadedByOfficerName: 'Suresh Patil',
    departmentId: 'dept_rev_01',
    departmentName: 'Revenue / Land Records',
    fileSizeBytes: 2450890,
    mimeType: 'application/pdf',
    s3Bucket: 'gov-land-vault-prod-west',
    s3Key: 'documents/mh/pune/haveli/hinjawadi/210-4/court_injunction_os441.pdf',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-west/documents/mh/court_injunction_os441.pdf',
    verificationStatus: 'REJECTED',
    uploadDate: '2026-08-18T12:00:00Z',
    metadata: {
      hashMD5: '3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e'
    }
  },
  {
    id: 'doc_006',
    documentName: 'Property Tax Paid Receipt 2026-27 - KA-BLR-204.pdf',
    documentType: 'TAX_RECEIPT',
    landId: 'KA-BLR-204',
    uploadedByOfficerId: 'off_006',
    uploadedByOfficerName: 'Priya Sharma',
    departmentId: 'dept_mun_04',
    departmentName: 'Municipality / Local Body',
    fileSizeBytes: 890400,
    mimeType: 'application/pdf',
    s3Bucket: 'gov-land-vault-prod-south',
    s3Key: 'documents/ka/bengaluru/whitefield/88-1a/bbmp_tax_2026_27.pdf',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/gov-land-vault-prod-south/documents/ka/bbmp_tax_2026_27.pdf',
    verificationStatus: 'VERIFIED',
    uploadDate: '2026-08-16T16:00:00Z',
    metadata: {
      hashMD5: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud_001',
    officerId: 'off_001',
    officerName: 'Ravi Kumar',
    officerDesignation: 'Tahsildar',
    departmentName: 'Revenue / Land Records',
    action: 'LAND_VERIFIED',
    module: 'LAND_GOVERNANCE',
    landId: 'TN-CHE-101',
    previousValue: { revenueStatus: 'PENDING', verifiedBy: null },
    newValue: { revenueStatus: 'VERIFIED', verifiedBy: 'Ravi Kumar', comments: 'Patta Chitta Record #892 verified.' },
    ipAddress: '10.14.88.21 (NIC GovNet VPN)',
    timestamp: '2026-08-20T11:30:00Z',
    status: 'SUCCESS'
  },
  {
    id: 'aud_002',
    officerId: 'off_002',
    officerName: 'Karthik Subramanian',
    officerDesignation: 'Surveyor',
    departmentName: 'Survey & Land Records',
    action: 'BOUNDARY_UPDATED',
    module: 'DIGITAL_TWIN',
    landId: 'TN-CHE-101',
    previousValue: { postGisLayer: 'ambattur_raw_unverified', vertexCount: 4 },
    newValue: { postGisLayer: 'ambattur_142_3b', vertexCount: 5, accuracyCm: 1.8 },
    ipAddress: '10.14.88.45 (NIC GovNet VPN)',
    timestamp: '2026-08-22T14:15:00Z',
    status: 'SUCCESS'
  },
  {
    id: 'aud_003',
    officerId: 'off_003',
    officerName: 'Meenakshi Sundaram',
    officerDesignation: 'Sub-Registrar',
    departmentName: 'Registration & Stamps',
    action: 'DOCUMENT_UPLOADED',
    module: 'DOCUMENTS',
    landId: 'TN-CHE-101',
    previousValue: null,
    newValue: { documentName: 'Registered Sale Deed - TN-CHE-101.pdf', s3Bucket: 'gov-land-vault-prod-south' },
    ipAddress: '10.14.92.10 (NIC GovNet VPN)',
    timestamp: '2026-08-24T09:45:00Z',
    status: 'SUCCESS'
  },
  {
    id: 'aud_004',
    officerId: 'off_005',
    officerName: 'Suresh Patil',
    officerDesignation: 'Tahsildar',
    departmentName: 'Revenue / Land Records',
    action: 'LAND_VERIFIED',
    module: 'LAND_GOVERNANCE',
    landId: 'MH-PUN-309',
    previousValue: { revenueStatus: 'PENDING' },
    newValue: { revenueStatus: 'REJECTED', reason: 'Civil Court Injunction OS 441/2025' },
    ipAddress: '10.18.22.90 (NIC GovNet VPN)',
    timestamp: '2026-08-18T12:00:00Z',
    status: 'WARNING'
  },
  {
    id: 'aud_005',
    officerId: 'super_admin_01',
    officerName: 'Super Admin (System)',
    officerDesignation: 'Chief Land Governance Officer',
    departmentName: 'Governance & National Portal Administration',
    action: 'OFFICER_CREATED',
    module: 'ORGANIZATION',
    previousValue: null,
    newValue: { officerName: 'Priya Sharma', employeeId: 'KA-REV-72941', designation: 'Tahsildar' },
    ipAddress: '10.0.1.1 (National NIC Core)',
    timestamp: '2026-08-10T10:00:00Z',
    status: 'SUCCESS'
  },
  {
    id: 'aud_006',
    officerId: 'super_admin_01',
    officerName: 'Super Admin (System)',
    officerDesignation: 'Chief Land Governance Officer',
    departmentName: 'Governance & National Portal Administration',
    action: 'PERMISSION_CHANGED',
    module: 'ACCESS_CONTROL',
    previousValue: { roleId: 'role_revofficer', permissionsCount: 3 },
    newValue: { roleId: 'role_revofficer', permissionsCount: 4, added: 'VERIFY_TAX' },
    ipAddress: '10.0.1.1 (National NIC Core)',
    timestamp: '2026-08-08T15:20:00Z',
    status: 'SUCCESS'
  }
];

export const INITIAL_STATS: DashboardStats = {
  totalParcels: 18456,
  verifiedParcels: 14202,
  pendingVerification: 4130,
  disputedParcels: 124,
  totalOfficers: 428,
  activeDepartments: 4,
  monthlyTrends: [
    { month: 'Jan', verified: 940, pending: 220, rejected: 14 },
    { month: 'Feb', verified: 1120, pending: 190, rejected: 18 },
    { month: 'Mar', verified: 1350, pending: 240, rejected: 12 },
    { month: 'Apr', verified: 1280, pending: 210, rejected: 16 },
    { month: 'May', verified: 1460, pending: 280, rejected: 22 },
    { month: 'Jun', verified: 1620, pending: 260, rejected: 19 },
    { month: 'Jul', verified: 1810, pending: 310, rejected: 25 },
    { month: 'Aug', verified: 1940, pending: 290, rejected: 15 }
  ],
  departmentVerificationRate: [
    { department: 'Revenue / RoR', verified: 16820, pending: 1420, rejected: 216 },
    { department: 'Survey & DGPS', verified: 15410, pending: 2810, rejected: 236 },
    { department: 'Registration & Deeds', verified: 14890, pending: 3240, rejected: 326 },
    { department: 'Municipality / Local Body', verified: 14202, pending: 3990, rejected: 264 }
  ],
  landTypeDistribution: [
    { type: 'COMMERCIAL', count: 4210, areaHectares: 12450 },
    { type: 'AGRICULTURAL', count: 8120, areaHectares: 48900 },
    { type: 'RESIDENTIAL', count: 4680, areaHectares: 9420 },
    { type: 'INDUSTRIAL', count: 980, areaHectares: 6810 },
    { type: 'GOVERNMENT', count: 466, areaHectares: 14200 }
  ],
  recentActivity: [],
  recentOfficerActivity: []
};

