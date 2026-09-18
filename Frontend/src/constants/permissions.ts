import { Permission } from '../types';

export const ALL_PERMISSIONS: Permission[] = [
  // Revenue / Land Records
  {
    id: 'perm_rev_1',
    code: 'VIEW_LAND',
    name: 'View Land Records',
    category: 'REVENUE',
    description: 'Allows reading baseline land record registry data, survey numbers, and extents.'
  },
  {
    id: 'perm_rev_2',
    code: 'VIEW_GIS',
    name: 'View GIS Spatial Map',
    category: 'REVENUE',
    description: 'Allows viewing GIS vector boundaries, satellite overlays, and spatial layers.'
  },
  {
    id: 'perm_rev_3',
    code: 'VERIFY_OWNERSHIP',
    name: 'Verify Ownership & Title',
    category: 'REVENUE',
    description: 'Allows validating legal title certificates, Patta/Chitta, and Record of Rights (RoR).'
  },
  {
    id: 'perm_rev_4',
    code: 'APPROVE_MUTATION',
    name: 'Approve Land Mutation',
    category: 'REVENUE',
    description: 'Allows executing mutation orders and updating title holders in digital land registry.'
  },
  {
    id: 'perm_rev_5',
    code: 'VIEW_TRANSFER_HISTORY',
    name: 'View Transfer & Deed History',
    category: 'REVENUE',
    description: 'Allows viewing historical ownership graph and lineage transitions.'
  },
  {
    id: 'perm_rev_6',
    code: 'VIEW_DOCUMENTS',
    name: 'View S3/MinIO Documents',
    category: 'REVENUE',
    description: 'Allows reading and downloading uploaded sale deeds, maps, and affidavits.'
  },

  // Survey & Land Records
  {
    id: 'perm_surv_1',
    code: 'CREATE_SURVEY',
    name: 'Create Digital Survey',
    category: 'SURVEY',
    description: 'Allows initiating DGPS/TotalStation survey records for land parcels.'
  },
  {
    id: 'perm_surv_2',
    code: 'UPDATE_PROPOSED_BOUNDARY',
    name: 'Update Proposed Boundary GeoJSON',
    category: 'SURVEY',
    description: 'Allows editing spatial boundary polygons and GeoServer layer coordinates.'
  },
  {
    id: 'perm_surv_3',
    code: 'UPLOAD_SURVEY',
    name: 'Upload FMB / GeoTIFF Survey Map',
    category: 'SURVEY',
    description: 'Allows uploading Field Measurement Books (FMB) and vector geo-packages.'
  },
  {
    id: 'perm_surv_4',
    code: 'SUBMIT_VERIFICATION',
    name: 'Submit Survey Verification',
    category: 'SURVEY',
    description: 'Allows issuing official survey clearance for land verification pipeline.'
  },

  // Registration & Stamps
  {
    id: 'perm_reg_1',
    code: 'VERIFY_REGISTRATION',
    name: 'Verify Stamp Deed Registration',
    category: 'REGISTRATION',
    description: 'Allows confirming deed authenticity against SRO registration ledger.'
  },
  {
    id: 'perm_reg_2',
    code: 'UPLOAD_REGISTRATION_DOCUMENT',
    name: 'Upload Certified Sale Deed',
    category: 'REGISTRATION',
    description: 'Allows uploading registered transfer deeds and encumbrance certificates.'
  },
  {
    id: 'perm_reg_3',
    code: 'VIEW_OWNERSHIP',
    name: 'View Encumbrance & Ownership',
    category: 'REGISTRATION',
    description: 'Allows checking previous registered encumbrance records.'
  },

  // Municipality / Local Body
  {
    id: 'perm_mun_1',
    code: 'VIEW_PROPERTY',
    name: 'View Municipal Assessment',
    category: 'MUNICIPALITY',
    description: 'Allows viewing municipal property ID, ward classification, and building approvals.'
  },
  {
    id: 'perm_mun_2',
    code: 'VERIFY_PROPERTY',
    name: 'Verify Property Zonal Layout',
    category: 'MUNICIPALITY',
    description: 'Allows verifying master plan zoning compliance and ward boundaries.'
  },
  {
    id: 'perm_mun_3',
    code: 'VERIFY_TAX',
    name: 'Verify Property Tax Clearance',
    category: 'MUNICIPALITY',
    description: 'Allows verifying property tax clearance status and municipal dues.'
  },

  // Super Admin / Governance
  {
    id: 'perm_sys_1',
    code: 'MANAGE_DEPARTMENTS',
    name: 'Manage Departments',
    category: 'SYSTEM',
    description: 'Full create, edit, activate and deactivate control on departments.'
  },
  {
    id: 'perm_sys_2',
    code: 'MANAGE_DESIGNATIONS',
    name: 'Manage Designations',
    category: 'SYSTEM',
    description: 'Full create, edit, activate and deactivate control on designations.'
  },
  {
    id: 'perm_sys_3',
    code: 'MANAGE_OFFICERS',
    name: 'Manage Officers & Scope',
    category: 'SYSTEM',
    description: 'Create, update, deactivate officers and assign geographical jurisdictions.'
  },
  {
    id: 'perm_sys_4',
    code: 'MANAGE_ROLES',
    name: 'Manage Roles & RBAC',
    category: 'SYSTEM',
    description: 'Define roles and attach granular permission policies.'
  },
  {
    id: 'perm_sys_5',
    code: 'VIEW_AUDIT_LOGS',
    name: 'View Immutable Audit Logs',
    category: 'SYSTEM',
    description: 'Inspect complete system activity and diff logs.'
  },
  {
    id: 'perm_sys_6',
    code: 'MANAGE_SETTINGS',
    name: 'Configure System Settings',
    category: 'SYSTEM',
    description: 'Configure GeoServer, PostGIS, S3/MinIO and Neo4j connection parameters.'
  }
];

export const PERMISSION_GROUPS = [
  { category: 'REVENUE', title: 'Revenue / Land Records Department' },
  { category: 'SURVEY', title: 'Survey & Land Records Department' },
  { category: 'REGISTRATION', title: 'Registration & Stamps Department' },
  { category: 'MUNICIPALITY', title: 'Municipality / Local Body' },
  { category: 'SYSTEM', title: 'Super Admin System Governance' },
];
